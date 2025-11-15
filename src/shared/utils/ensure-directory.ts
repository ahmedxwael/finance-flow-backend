import { existsSync, mkdirSync } from "fs";
import path from "path";
import { getBaseDirectory } from "./serverless";

/**
 * Ensure uploads directory exists
 * In serverless environments, uses /tmp directory
 */
export const ensureDirectory = (directory: string) => {
  const baseDir = getBaseDirectory();
  const fullPath = path.join(baseDir, directory);

  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }

  return fullPath;
};
