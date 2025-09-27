import cron from "node-cron";
import ProductOrder, { IProductOrder } from "../models/productOrder.model";
import { Request, Response } from "express";
import Product from "../models/product.model";
import { pushNotification } from "../utils/PushNotification";

export const handleExpiredProduct = async (
  product: IProductOrder
): Promise<void> => {
  try {
    const expiredQuantity = product.remainingQte;

    await ProductOrder.findByIdAndUpdate(product._id, {
      isExpired: true,
      expiredQuantity: expiredQuantity,
      remainingQte: 0,
    });

    await pushNotification(
      `Product Expired: ${product.productId}`,
      `Product with ID ${product.productId} has expired. Expired quantity: ${expiredQuantity}`,
      "expiry_warning",
      `${process.env.CLIENT_ORIGIN}/api/products/${product.productId}`
    );

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $inc: { currentStock: -expiredQuantity } },
      { new: true }
    );
    if (!updatedProduct) {
      throw new Error(`Product with ID ${product._id} not found`);
    }

    await pushNotification(
      `Product Expired: ${updatedProduct.name}`,
      `Product ${updatedProduct.name} has expired. Expired quantity: ${expiredQuantity}`,
      "expiry_warning",
      `${process.env.CLIENT_ORIGIN}/api/products/${product.productId}`
    );

    if (updatedProduct?.currentStock < updatedProduct?.minQty) {
      await pushNotification(
        `${updatedProduct.name} Stock Alert`,
        `Product ${updatedProduct.name} is below minimum stock level! Current stock: ${updatedProduct.currentStock}`,
        "low_stock",
        `${process.env.CLIENT_ORIGIN}/api/products/${updatedProduct._id}`
      );
    }

    console.log(
      `Product ${product.productId} expired - Removed ${expiredQuantity} units`
    );

    //  Send notifications
  } catch (error) {
    console.error(`Error handling expired product ${product._id}:`, error);
  }
};

export const processExpiredProducts = async (): Promise<void> => {
  try {
    const now = new Date();

    const expiredProducts = await ProductOrder.find({
      expirationDate: { $lte: now },
      isExpired: false,
      remainingQte: { $gt: 0 },
    });

    console.log(`Found ${expiredProducts.length} expired products to process`);

    for (const product of expiredProducts) {
      await handleExpiredProduct(product);
    }
  } catch (error) {
    console.error("Error processing expired products:", error);
  }
};

export const getProductsExpiringSoon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { daysAhead = 7 } = req.query;
    const futureDate = new Date();

    futureDate.setDate(futureDate.getDate() + Number(daysAhead));

    const producstExpireSoon = await ProductOrder.find({
      expirationDate: {
        $lte: futureDate,
        $gt: new Date(),
      },
      isExpired: false,
      remainingQte: { $gt: 0 },
    }).populate("productId");

    res.status(200).json({ producstExpireSoon });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

// Usage Examples:

// 1. Start the timer when your application starts
// ExpirationTimer.start(); // Runs every hour
// ExpirationTimer.start('*/30 * * * *'); // Runs every 30 minutes
// ExpirationTimer.start('0 0 * * *'); // Runs daily at midnight

// 2. Manual check
// const expiredCount = await ExpirationHandler.checkAndProcessExpired();

// 3. Get products expiring soon
// const expiringProducts = await ExpirationHandler.getProductsExpiringSoon(3); // 3 days ahead

// 4. Use middleware when querying products
// const product = await ProductOrder.findById(id);
// await checkExpirationMiddleware(product);

export default ProductOrder;
