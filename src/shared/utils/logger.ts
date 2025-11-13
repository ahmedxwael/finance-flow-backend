import { __DEV__, LOG_LEVEL } from "@/config/env";
import dayjs from "dayjs";
import pino from "pino";

// Determine log level from environment or default to 'info'
const isDev = __DEV__;
const logLevel = LOG_LEVEL || (isDev ? "debug" : "info");

// Base logger configuration
const baseConfig: pino.LoggerOptions = {
  level: logLevel,
  base: {
    pid: false,
    env: process.env.NODE_ENV || "development",
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
};

export const log = pino({
  ...baseConfig,
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname,env",
            translateTime: "SYS:standard",
            singleLine: false,
            hideObject: false,
          },
        },
      }
    : {}),
});

// Helper function for error logging with stack trace
export const logError = (
  error: Error | unknown,
  context?: Record<string, any>
) => {
  const errorContext = {
    ...context,
    error: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    },
  };

  log.error(
    errorContext,
    error instanceof Error ? error.message : String(error)
  );
};
