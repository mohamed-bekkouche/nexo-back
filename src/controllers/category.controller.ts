import { Request, Response } from "express";
import Category from "../models/category.model";
import { deleteImage } from "../utils/Delete";

export const getCategoriesByFilter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.query;
    const query: any = {};
    if (name) query.name = { $rgex: name, $options: "i" };

    const categories = await Category.find(query).sort({ createdAt: -1 });

    res.status(200).json({ categories });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "All fields must fill" });
      return;
    }
    const filename = req.file?.filename;
    const newCategory = await Category.create({
      name,
      description,
      image: `/uploads/categories/${filename}`,
    });

    res.status(200).json({
      message: "Category created Successfully",
      category: newCategory,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.categoryId;

    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    if (name) category.name = name;
    if (description) category.description = description;

    const filename = req.file?.filename;
    if (filename) {
      deleteImage(category.image);
      category.image = `/uploads/categories/${filename}`;
    }

    await category.save();

    res.status(200).json({
      message: "Category updated Successfully",
      category,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};
