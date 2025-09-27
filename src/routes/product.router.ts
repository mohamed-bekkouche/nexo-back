import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getLowStockProducts,
  getOverStockProducts,
  getProduct,
  updateProduct,
} from "../controllers/product.controller";
import { authenticate, requireAdmin } from "../middlewares/Auth";
import { upload } from "../middlewares/Multer";

const productRouter = Router();

productRouter.use(authenticate);

productRouter.post("/", upload("products").single("image"), createProduct);
productRouter.put("/:productId", requireAdmin, updateProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/low", getLowStockProducts);
productRouter.get("/over", getOverStockProducts);
productRouter.get("/:productId", getProduct);

export default productRouter;
