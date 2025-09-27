import { Schema, model, Document, MongooseError } from "mongoose";

export interface IProduct extends Document {
  name: string;
  barcode: string;
  unit: "litre" | "kg" | "boit";
  categoryId: Schema.Types.ObjectId;
  imageUrl: string;
  currentStock: number;
  minQty: number;
  maxQty: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product Name Is Required"],
      trim: true,
    },
    barcode: {
      type: String,
      required: [true, "BarCode Is Required"],
      unique: true,
    },
    unit: {
      type: String,
      enum: ["litre", "kg", "boit"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product Category Is Required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Product Image Is Required"],
    },
    currentStock: {
      type: Number,
      required: [true, "Product Stock Is Required"],
      default: 0,
    },
    minQty: {
      type: Number,
      default: 0,
    },
    maxQty: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = model<IProduct>("Product", productSchema);
export default Product;
