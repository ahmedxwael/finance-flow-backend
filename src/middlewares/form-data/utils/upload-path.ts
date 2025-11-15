import path from "path";
import { UPLOADS_DIR_NAME } from "../../../modules/file-uploads/utils";

/**
 * Sanitize fieldname to prevent path traversal attacks
 */
export const sanitizeFieldname = (fieldName: string): string => {
  // Remove path separators and dangerous characters
  return fieldName
    .replace(/[\/\\]/g, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .substring(0, 50); // Limit length
};

/**
 * Get safe upload path with sanitized fieldname
 */
export const getUploadPath = (fieldName: string): string => {
  const sanitized = sanitizeFieldname(fieldName);

  if (!sanitized) {
    throw new Error("Invalid fieldname");
  }

  return path.join(UPLOADS_DIR_NAME, sanitized);
};
