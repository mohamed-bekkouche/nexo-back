import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/Auth";
import {
  createSupplier,
  getSupplierById,
  getSuppliers,
  toggleSupplierActivation,
} from "../controllers/suplier.controller";

const supplierRouter = Router();

supplierRouter.use(authenticate);

supplierRouter.post("/", requireAdmin, createSupplier);
supplierRouter.get("/", getSuppliers);
supplierRouter.get("/:supplierId", getSupplierById);
supplierRouter.put("/:supplierId", requireAdmin, toggleSupplierActivation);

export default supplierRouter;
