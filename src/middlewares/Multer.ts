import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const UPLOAD_BASE_DIR = path.resolve("src/uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
  const ext = path.extname(file.originalname).toLowerCase();
  const isImage = file.mimetype.startsWith("image/");

  if (isImage && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only valid image files are allowed"));
  }
};
export const upload = (directory = "") => {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const subDir = path.join(UPLOAD_BASE_DIR, directory);

      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }

      cb(null, subDir);
    },
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toLowerCase();

      cb(null, `${baseName}_${timestamp}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
};
