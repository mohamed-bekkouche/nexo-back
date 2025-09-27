import { Document, MongooseError, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullname: string;
  email: string;
  password: string;
  avatar?: string;
  role: "admin" | "staff";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: [true, "Full Name Is Required"],
    },
    email: {
      type: String,
      required: [true, "User Email Is Required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err: unknown) {
    return next(err as MongooseError); //
  }
});

userSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.password) {
    throw new Error("Password hash not loaded on user document");
  }
  return bcrypt.compare(candidate, this.password);
};

const User = model<IUser>("User", userSchema);
export default User;
