import { Express } from "express";
import { logError } from "../shared/utils";
import { connectToDB } from "./db";
import { startServer } from "./server";

export * from "./db";
export * from "./router";
export * from "./server";

export async function startApplication(app: Express): Promise<void> {
  try {
    await connectToDB();
    await startServer(app);
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}
