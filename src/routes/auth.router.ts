import { Router } from "express";
import {
  login,
  logout,
  refreshTokens,
  updateUser,
} from "../controllers/auth.controller";
import { upload } from "../middlewares/Multer";
import { authenticate } from "../middlewares/Auth";

const authRouter = Router();
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshTokens);
authRouter.put("/profile", authenticate, updateUser);
export default authRouter;
