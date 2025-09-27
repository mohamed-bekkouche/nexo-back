import { Document, Schema, model } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  contactPerson: String;
  email: string;
  phone: string;
  address: string;
  categoryIds: Schema.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, "Shop Name Is Required"],
    },
    contactPerson: {
      type: String,
      required: [true, "contact Person Name Is Required"],
    },
    email: {
      type: String,
      required: [true, "Shop Email Is Required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone Number Is Required"],
    },
    address: {
      type: String,
      required: [true, "Address Is Required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categoryIds: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

const Supplier = model<ISupplier>("Supplier", supplierSchema);
export default Supplier;
