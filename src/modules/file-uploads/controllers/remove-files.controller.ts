import { Request, Response } from "express";
import { existsSync, readdirSync, rmdirSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { http } from "../../../core";
import { getBaseDirectory } from "../../../shared/utils";
import { UPLOADS_DIR_NAME } from "../utils";

interface FileToDelete {
  filename: string;
  fieldname: string;
}

interface DeleteResult {
  filename: string;
  success: boolean;
  error?: string;
}

/**
 * Build response for file deletion results
 * Handles both success and failure cases
 */
const buildResponse = (total: number, failedFiles: DeleteResult[]) => {
  const successful = total - failedFiles.length;
  const hasFailures = failedFiles.length > 0;

  return {
    success: !hasFailures,
    message: hasFailures
      ? `Deleted ${successful} file(s), ${failedFiles.length} failed.`
      : `Successfully deleted ${total} file(s).`,
    total,
    successful,
    failed: failedFiles.length,
    ...(hasFailures && {
      errors: failedFiles.map((f) => ({
        filename: f.filename,
        error: f.error,
      })),
    }),
    user: http.user,
  };
};

/**
 * Remove a single file specified by filename and fieldname.
 * Throws an error if the file does not exist or cannot be removed.
 * Uses the same path logic as uploads to support serverless environments.
 */
const findAndDeleteFile = async (
  filename: string,
  fieldname: string
): Promise<void> => {
  const baseDir = getBaseDirectory();
  const filePath = path.join(baseDir, UPLOADS_DIR_NAME, fieldname, filename);

  if (!existsSync(filePath)) {
    throw new Error(`File "${filename}" not found in folder "${fieldname}"`);
  }

  try {
    const dirPath = path.join(baseDir, UPLOADS_DIR_NAME, fieldname);

    // Delete the file
    await fs.unlink(filePath);

    // Delete the directory if it is empty
    if (readdirSync(dirPath).length === 0) {
      rmdirSync(dirPath);
    }
  } catch (err: any) {
    throw new Error(
      `Failed to remove file "${filename}" from "${fieldname}": ${err.message || err}`
    );
  }
};

/**
 * Process file deletion and return result
 */
const processFileDeletion = async (
  file: FileToDelete
): Promise<DeleteResult> => {
  const { filename, fieldname } = file;

  try {
    await findAndDeleteFile(filename, fieldname);
    return { filename, success: true };
  } catch (error: any) {
    return {
      filename,
      success: false,
      error: error.message || "Unknown error",
    };
  }
};

/**
 * @description Remove files controller
 * @param req - The request object
 * @param res - The response object
 * @returns The response object
 *
 * Accepts:
 * - Body: { files: [{ filename: "abc.jpg", fieldname: "images" }] }
 */
export const removeFilesController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const files = http.input<FileToDelete[]>("files", []);

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No files provided. Use 'files' as an array of objects with filename and fieldname.",
        user: http.user,
      });
    }

    const deleteResults = await Promise.all(files.map(processFileDeletion));

    const failedFiles = deleteResults.filter((r) => !r.success);
    const statusCode = failedFiles.length === 0 ? 200 : 400;

    return res
      .status(statusCode)
      .json(buildResponse(files.length, failedFiles));
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while removing files",
      error: error.message,
      user: http.user,
    });
  }
};
