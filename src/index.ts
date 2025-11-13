import { Request, Response } from "express";
import { __DEV__ } from "./config/env";
import { connectToDB } from "./core/db";
import { createApp, startServer } from "./core/server";

// Initialize app promise (lazy initialization)
let appPromise: Promise<any> | null = null;

/**
 * Get or create the Express app instance
 */
async function getApp() {
  if (!appPromise) {
    await connectToDB();
    appPromise = createApp();
  }
  return appPromise;
}

/**
 * Vercel serverless function handler
 * This is the entry point for Vercel deployments
 */
export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  return app(req, res);
}

// For local development: start the server normally
if (__DEV__ || process.env.VERCEL !== "1") {
  (async () => {
    await connectToDB();
    await startServer();
  })();
}
