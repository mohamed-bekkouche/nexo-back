import { Request, Response } from "express";
import Supplier from "../models/supplier.model";

export const createSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, contactPerson, email, phone, address, categoryIds } =
      req.body;

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      res
        .status(400)
        .json({ message: "Supplier with this name already exists" });
      return;
    }

    const supplier = new Supplier({
      name,
      contactPerson,
      email,
      phone,
      address,
      categoryIds,
    });
    await supplier.save();

    res.status(201).json({ supplier });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getSuppliers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, page = 1, limit = 10, sortBy, order } = req.query;
    const query: any = {};
    if (name) query.name = { $regex: name, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const sortField = sortBy?.toString() || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    const suppliers = await Supplier.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Supplier.countDocuments(query);

    res
      .status(200)
      .json({ suppliers, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getSupplierById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }
    res.status(200).json({ supplier });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const toggleSupplierActivation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({ message: "supplier not found" });
      return;
    }
    supplier.isActive = !supplier.isActive;

    await supplier.save();

    res.status(200).json({
      message: `Supplier is ${
        supplier.isActive ? "Activated" : "Descativated"
      }`,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
