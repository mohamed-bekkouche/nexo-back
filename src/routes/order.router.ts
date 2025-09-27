import { Router } from "express";
import {
  createOrder,
  getOrder,
  getOrderAnalytics,
  getOrdersByFilter,
} from "../controllers/order.controller";
import { authenticate } from "../middlewares/Auth";

const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrdersByFilter);
orderRouter.get("/analytics", getOrderAnalytics);
orderRouter.get("/:orderId", getOrder);

export default orderRouter;
