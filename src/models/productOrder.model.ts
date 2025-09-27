import { Document, Schema, model } from "mongoose";

export interface IProductOrder extends Document {
  productId: Schema.Types.ObjectId;
  quantity: number;
  expirationDate: Date;
  unitCost: number;
  remainingQte: number;
  isExpired: boolean;
  expiredQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const productOrderSchema = new Schema<IProductOrder>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: [true, "productId is Required"],
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: [true, "Product Quantity is Required"],
    },
    expirationDate: {
      type: Date,
    },
    unitCost: {
      type: Number,
      required: [true, "Product Price is Required"],
    },
    remainingQte: {
      type: Number,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    expiredQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient expiration queries
productOrderSchema.index({ expirationDate: 1, isExpired: 1 });

const ProductOrder = model<IProductOrder>("ProductOrder", productOrderSchema);
export default ProductOrder;
