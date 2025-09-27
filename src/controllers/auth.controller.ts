import { Request, Response } from "express";
import User from "../models/user.model";
import { generateTokens, verifyToken } from "../utils/Token";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: "User is not active" });
      return;
    }

    const accessToken = generateTokens(
      user._id as string,
      user.role === "admin",
      res
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        createdAt: user.createdAt,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
        fullname: user.fullname,
        avatar: user.avatar,
      },
      access_token: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (_: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshTokens = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not found" });
      return;
    }

    const secret = process.env.REFRESH_SECRET || "default_refresh_secret_key";
    const decoded = verifyToken(refreshToken, secret);

    if (typeof decoded === "string") {
      res.status(400).json({ message: "Invalid refresh token" });
      return;
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ message: "User is blocked" });
      return;
    }

    const accessToken = generateTokens(
      user._id as string,
      user.role === "admin",
      res
    );

    res.status(200).json({ message: "Tokens refreshed", accessToken });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { password, newPassword } = req.body;

    const userId = req.user?.userId;
    const user = await User.findById(userId).select("+password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (newPassword && password) {
      const isMatch = await user.comparePassword(password.toString());

      if (!isMatch) {
        res
          .status(400)
          .json({ message: "The Password You provided is not correct" });
        return;
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      message: " User Updated Successfully",
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
