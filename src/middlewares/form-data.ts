import { Request } from "express";
import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import path from "path";

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadPath = path.join(process.cwd(), "uploads");
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Set upload destination and ensure directory exists
    const uploadPath = ensureUploadsDir();
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept all file types by default
  // You can add validation here if needed
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Middleware to handle multipart/form-data (file uploads)
 *
 * Usage:
 * - Single file: upload.single('fieldName')
 * - Multiple files: upload.array('fieldName', maxCount)
 * - Multiple fields: upload.fields([{ name: 'field1', maxCount: 1 }, { name: 'field2', maxCount: 3 }])
 * - Any files: upload.any()
 */
export const formData = upload;

/**
 * Helper middleware for single file upload
 */
export const uploadSingle = (fieldName: string = "file") => {
  return upload.single(fieldName);
};

/**
 * Helper middleware for multiple files upload
 */
export const uploadMultiple = (
  fieldName: string = "files",
  maxCount: number = 10
) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Helper middleware for multiple fields with files
 */
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => {
  return upload.fields(fields);
};

/**
 * Helper middleware for any files (no field name restriction)
 */
export const uploadAny = () => {
  return upload.any();
};
