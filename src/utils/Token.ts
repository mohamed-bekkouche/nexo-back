import jwt, { JwtPayload } from "jsonwebtoken";
import { Response } from "express";
import dotenv from "dotenv";

dotenv.config();

export const generateTokens = (
  userId: string,
  isAdmin: boolean,
  res: Response
): string => {
  const access_secret = process.env.ACCESS_SECRET || "default_secret_key";
  const refresh_secret = process.env.REFRESH_SECRET || "default_secret_key";

  const accessToken = jwt.sign({ userId, isAdmin }, access_secret, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId, isAdmin }, refresh_secret, {
    expiresIn: "7d",
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return accessToken;
};

export const verifyToken = (
  token: string,
  secret: string
): string | JwtPayload => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid token");
  }
};
