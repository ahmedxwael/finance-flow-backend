import { existsSync, mkdirSync } from "fs";
import path from "path";

// Ensure uploads directory exists
export const ensureDirectory = (directory: string) => {
  const fullPath = path.join(process.cwd(), directory);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }

  return fullPath;
};
