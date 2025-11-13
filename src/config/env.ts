// Ensure dotenv is loaded before reading env vars
import "dotenv/config";

// App Configuration
export const PORT = process.env.PORT || 3000;
export const __DEV__ = process.env.NODE_ENV === "development";
export const API_PREFIX = process.env.API_PREFIX || "api";

// Log Level Configuration
export const LOG_LEVEL = process.env.LOG_LEVEL || (__DEV__ ? "debug" : "info");

// MongoDB Configuration
export const DATABASE_NAME = process.env.DATABASE_NAME;
export const DATABASE_HOST = process.env.DATABASE_HOST || "localhost";
export const DATABASE_PORT = process.env.DATABASE_PORT || 27017;
export const DATABASE_URL = process.env.DATABASE_URL;
export const DATABASE_USER = process.env.DATABASE_USER;
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET!;

// SMTP Configuration
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
