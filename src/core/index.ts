import { Express } from "express";
import { connectToDB } from "./db";
import { startServer } from "./server";

export * from "./db";
export * from "./router";
export * from "./server";

export async function startApplication(app: Express): Promise<void> {
  await connectToDB();
  await startServer(app);
}
