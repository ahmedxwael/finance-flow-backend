export const UPLOADS_DIR_NAME = "uploads";
export const UPLOADS_FIELDS: (keyof Express.Multer.File)[] = [
  "fieldname",
  "originalname",
  "mimetype",
  "filename",
  "size",
];
