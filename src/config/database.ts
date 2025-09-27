import mongoose from "mongoose";

declare global {
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

export default async function connectDB() {
  if (global.__mongooseConn) return global.__mongooseConn;

  const uri = (process.env.MONGO_URI || "").trim();
  if (!uri) {
    throw new Error("MONGODB_URI (or MONGO_URI) is missing");
  }

  global.__mongooseConn = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  return global.__mongooseConn;
}
