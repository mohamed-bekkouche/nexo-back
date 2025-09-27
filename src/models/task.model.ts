import { Schema, model, Document } from "mongoose";

export interface ITask extends Document {
  taskNumber: string;
  staffId: Schema.Types.ObjectId;
  items: { productId: Schema.Types.ObjectId; quantity: number }[];
  status: "pending" | "completed" | "canceled";
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    taskNumber: { type: String, required: true, unique: true },
    staffId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Task = model<ITask>("Task", TaskSchema);

export default Task;
