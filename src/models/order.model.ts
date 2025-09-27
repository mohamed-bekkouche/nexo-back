import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  bon: string;
  orderNumber: string;
  supplierId: Schema.Types.ObjectId;
  staffId: Schema.Types.ObjectId;
  status: "pending" | "paid";
  totalAmount: number;
  items: Schema.Types.ObjectId[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  paidDate: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    bon: {
      type: String,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Order Supplier is required"],
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order Supplier is required"],
    },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    items: {
      type: [Schema.Types.ObjectId],
      ref: "ProductOrder",
      minlength: 1,
    },
    notes: {
      type: String,
    },

    paidDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
