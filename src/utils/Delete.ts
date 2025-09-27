import path from "path";
import fs from "fs";

export const deleteImage = (relativePath: string): void => {
  const fullPath = path.resolve("src" + relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`❌ Error deleting file: ${fullPath}`, err);
      } else {
        console.log(`🗑️ Deleted image: ${relativePath}`);
      }
    });
  } else {
    console.warn(`⚠️ File not found: ${relativePath}`);
  }
};
