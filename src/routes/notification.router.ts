import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/Auth";
import {
  getNotifications,
  readAllNotifications,
  readNotification,
} from "../controllers/notification.controller";

const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.use(requireAdmin);

notificationRouter.get("/", getNotifications);
notificationRouter.put("/", readAllNotifications);
notificationRouter.put("/:notificationId", readNotification);

export default notificationRouter;
