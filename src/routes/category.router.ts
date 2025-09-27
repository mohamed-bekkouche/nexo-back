import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoriesByFilter,
  updateCategory,
} from "../controllers/category.controller";
import { upload } from "../middlewares/Multer";

const categoryRouter = Router();

categoryRouter.get("/", getCategoriesByFilter);
categoryRouter.post("/", upload("categories").single("image"), createCategory);
categoryRouter.put(
  "/:categoryId",
  upload("categories").single("image"),
  updateCategory
);
categoryRouter.delete("/:categoryId", deleteCategory);

export default categoryRouter;
