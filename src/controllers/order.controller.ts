import { Request, Response } from "express";
import Product from "../models/product.model";
import Order from "../models/order.model";
import ProductOrder from "./productOrder.controller";

const generateOrderNumber = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit
  return `ORD-${date}-${rand}`;
};

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      items,
      supplierId,
      notes,
    }: {
      items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        expirationDate: Date;
      }[];
      supplierId: string;
      notes: string;
    } = req.body;

    let totalAmount = 0;
    const productOrdersPromises = items.map(
      async ({ productId, quantity, unitPrice, expirationDate }) => {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        product.currentStock = product.currentStock + quantity;
        await product.save();

        const productOrder = await ProductOrder.create({
          productId,
          quantity,
          unitCost: unitPrice,
          expirationDate,
          remainingQte: quantity,
        });
        await productOrder.save();

        totalAmount = totalAmount + unitPrice * quantity;

        return productOrder._id;
      }
    );

    const productOrders = await Promise.all(productOrdersPromises);

    const order = new Order({
      items: productOrders,
      supplierId,
      staffId: req.user?.userId,
      totalAmount,
      notes,
      orderNumber: generateOrderNumber(),
    });

    const filename = req.file?.filename;
    if (filename) {
      order.bon = `/uploads/orders/${filename}`;
    }

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      orderId: order._id,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getOrdersByFilter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      orderNumber,
      staffId,
      status,
      sortBy,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    if (Number(page) < 1 || Number(limit) < 1) {
      res
        .status(400)
        .json({ message: "Page and limit must be greater than 0" });
      return;
    }

    const query: any = req.user?.isAdmin ? {} : { staffId: req.user?.userId };
    if (status) query.status = status;
    if (staffId) query.staffId = staffId;
    if (orderNumber) query.orderNumber = { $regex: orderNumber, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const sortField = sortBy?.toString() || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const orders = await Order.find(query)
      .populate([
        { path: "staffId", select: "avatar email fullname" },
        // { path: "supplierId", select: "email" },
        {
          path: "items",
          populate: {
            path: "productId",
            select: "name price quantity",
          },
        },
      ])
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);

    res
      .status(200)
      .json({ orders, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate([
      { path: "staffId", select: "avatar email fullname" },
      // { path: "supplierId", select: "email" },
      {
        path: "items",
        populate: {
          path: "productId",
          select: "name price quantity",
        },
      },
    ]);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (order.staffId.toString() !== req.user?.userId && !req.user?.isAdmin) {
      res.status(404).json({ message: "You can't access this order" });
      return;
    }

    res.status(200).json({ order });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getOrderAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { period = "month" } = req.query;

    // Validate period parameter
    const validPeriods = ["week", "month", "year"];
    if (!validPeriods.includes(period as string)) {
      res.status(400).json({
        message: "Invalid period. Use 'week', 'month', or 'year'",
      });
      return;
    }

    // Basic counts with correct status values
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const paidOrders = await Order.countDocuments({ status: "paid" });

    // Calculate total spending (what we spent on products)
    const totalSpending = await Order.aggregate([
      { $match: { status: "paid" } }, // Only count paid orders
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalSpent = totalSpending.length > 0 ? totalSpending[0].total : 0;

    // Dynamic aggregation based on selected period only
    let groupStage: any = {};
    let sortStage: any = {};
    let limitCount = 12;
    let periodLabel: any = {};

    if (period === "week") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        },
      };
      sortStage = { "_id.year": -1, "_id.week": -1 };
      limitCount = 8;
      periodLabel = {
        $concat: [{ $toString: "$_id.year" }, "-W", { $toString: "$_id.week" }],
      };
    } else if (period === "month") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      };
      sortStage = { "_id.year": -1, "_id.month": -1 };
      limitCount = 12;
      periodLabel = {
        $concat: [
          { $toString: "$_id.year" },
          "-",
          {
            $cond: [
              { $lt: ["$_id.month", 10] },
              { $concat: ["0", { $toString: "$_id.month" }] },
              { $toString: "$_id.month" },
            ],
          },
        ],
      };
    } else {
      // year
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
        },
      };
      sortStage = { "_id.year": -1 };
      limitCount = 5;
      periodLabel = { $toString: "$_id.year" };
    }

    // Add common fields to groupStage
    groupStage.totalOrders = { $sum: 1 };
    groupStage.totalSpent = {
      $sum: {
        $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0],
      },
    };
    groupStage.pendingOrders = {
      $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
    };
    groupStage.paidOrders = {
      $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
    };

    const periodData = await Order.aggregate([
      { $group: groupStage },
      { $sort: sortStage },
      { $limit: limitCount },
      {
        $addFields: {
          periodLabel: periodLabel,
        },
      },
      {
        $project: {
          _id: 1,
          periodLabel: 1,
          totalOrders: 1,
          totalSpent: 1,
          pendingOrders: 1,
          paidOrders: 1,
        },
      },
    ]);

    // Reverse to show chronological order (oldest to newest)
    periodData.reverse();

    res.status(200).json({
      summary: {
        totalOrders,
        pendingOrders,
        paidOrders,
        totalSpent: totalSpent,
      },
      period: period,
      data: periodData,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
