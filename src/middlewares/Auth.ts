import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/Token";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "default_secret_key";
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token, ACCESS_SECRET) as {
      userId: string;
      isAdmin: boolean;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ message: "Admins only." });
    return;
  }
  next();
};
