import { NextFunction, Request, Response } from "express";
import { __DEV__ } from "../config";
import { log, logError } from "../utils";

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

export const notFoundHandler = (req: Request, res: Response) => {
  log.warn(`Route ${req.method} ${req.url} not found`);

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
