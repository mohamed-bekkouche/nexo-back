import { Request, Response } from "express";
import Task from "../models/task.model";
import { pushNotification } from "../utils/PushNotification";

const generateTaskNumber = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit
  return `ORD-${date}-${rand}`;
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { staffId, items, deadline } = req.body;

    if (!staffId || !items || !deadline || items.length === 0) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const newTask = await Task.create({
      taskNumber: generateTaskNumber(),
      staffId,
      items,
      deadline,
    });

    res
      .status(200)
      .json({ message: "Task created Successfully", task: newTask });
  } catch (error: any) {
    console.error("Error : ", error);
    res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const {
      status,
      sortBy,
      order,
      taskNumber,
      page = 1,
      limit = 10,
    } = req.query;
    if (Number(page) < 1 || Number(limit) < 1) {
      res
        .status(400)
        .json({ message: "Page and limit must be greater than 0" });
      return;
    }

    const query: any = req.user?.isAdmin ? {} : { staffId: req.user?.userId };

    if (status) query.status = status;
    if (taskNumber) query.taskNumber = { $regex: taskNumber, $options: "i" };

    const sortField = sortBy?.toString() || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find()
      .populate("staffId", "fullname avatar email")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);
    res.status(200).json({
      total,
      pages: Math.ceil(total / Number(limit)),
      tasks,
    });
  } catch (error: any) {
    console.error("Error : ", error);
    res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId).populate(
      "staffId",
      "fullname avatar email"
    );

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    if (
      (task.staffId as any)._id?.toString() !== req.user?.userId &&
      !req.user?.isAdmin
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json({ task });
  } catch (error: any) {
    console.error("Error : ", error);
    res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "canceled"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    if (
      (task.staffId as any)._id?.toString() !== req.user?.userId &&
      !req.user?.isAdmin
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    if (status === "canceled" && req.user?.isAdmin === false) {
      res.status(403).json({ message: "Only admins can cancel tasks" });
      return;
    }
    if (
      status === "completed" &&
      (task.staffId as any)._id?.toString() === req.user?.userId
    ) {
      await pushNotification(
        ` Task Completed: ${task.taskNumber} `,
        `The task ${task.taskNumber} has been marked as completed.`,
        "complited_task",
        `${process.env}/api/tasks/${task._id}`
      );
    }
    task.status = status;
    await task.save();

    res.status(200).json({ message: "Task status updated", task });
  } catch (error: any) {
    console.error("Error : ", error);
    res
      .status(500)
      .json({ message: "Internal server error", err: error.message });
  }
};
