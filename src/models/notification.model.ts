import { model, Schema } from "mongoose";

export interface INotification {
  _id: string;
  type: "low_stock" | "budget_alert" | "expiry_warning" | "complited_task";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ["low_stock", "budget_alert", "expiry_warning"],
    },
    title: String,
    message: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
  },
  { timestamps: true }
);

const Notification = model<INotification>("Notification", notificationSchema);

export default Notification;
