import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/Auth";
import {
  createTask,
  getTaskById,
  getTasks,
  updateTaskStatus,
} from "../controllers/task.controller";

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.post("/", requireAdmin, createTask);
taskRouter.get("/", getTasks);
taskRouter.get("/:taskId", getTaskById);
taskRouter.put("/:taskId", updateTaskStatus);

export default taskRouter;
