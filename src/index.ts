import { Request, Response } from "express";
import { __DEV__ } from "./config/env";
import { connectToDB } from "./core/db";
import { createApp, startServer } from "./core/server";

// Initialize app eagerly at module load (not lazy)
// This ensures the app is ready as soon as possible
const appPromise = (async () => {
  await connectToDB();
  return await createApp();
})();

// For local development: start the server
if (__DEV__ || process.env.VERCEL !== "1") {
  (async () => {
    await connectToDB();
    await startServer();
  })();
}

// Export handler for Vercel
// Vercel's @vercel/node expects a default export function that handles requests
export default async function handler(req: Request, res: Response) {
  const app = await appPromise;
  return app(req, res);
}
