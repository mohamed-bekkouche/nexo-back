import { Router } from "express";
import { upload } from "../middlewares/Multer";
import { authenticate, requireAdmin } from "../middlewares/Auth";
import {
  getAllStaff,
  getCategoryAnalytics,
  getMonthlySpendingAnalytics,
  newStaffMember,
  toggleStaffActivation,
  deleteStaffMember
} from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

adminRouter.get("/staffs", getAllStaff);
adminRouter.post("/staffs", upload("staffs").single("image"), newStaffMember);
adminRouter.delete("/staffs/:staffId", deleteStaffMember);
adminRouter.put("/staffs/:staffId", toggleStaffActivation);
adminRouter.get("/analytics/category", getCategoryAnalytics);
adminRouter.get("/analytics/monthly", getMonthlySpendingAnalytics);

export default adminRouter;
