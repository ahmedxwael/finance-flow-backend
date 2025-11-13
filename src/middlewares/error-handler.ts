import { __DEV__ } from "../config/env";
import { log, logError } from "../shared/utils";
import { NextFunction, Request, Response } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log error with context
  logError(error, {
    method: req.method,
    url: req.url,
    statusCode,
    isOperational,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Send error response
  const errorResponse: any = {
    error: {
      message: isOperational ? error.message : "Internal Server Error",
      statusCode,
    },
  };

  // Include stack trace in development
  if (__DEV__ && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Common browser/DevTools requests that should be silently ignored
const IGNORED_404_PATHS = [
  "/.well-known/",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export const notFoundHandler = (req: Request, res: Response) => {
  // Check if this is a common browser/DevTools request that should be ignored
  const shouldIgnore = IGNORED_404_PATHS.some((path) =>
    req.url.startsWith(path)
  );

  // Only log if it's not an ignored path
  if (!shouldIgnore) {
    log.warn(`Route ${req.method} ${req.url} not found`);
  }

  return res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.url} not found`,
      statusCode: 404,
    },
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
