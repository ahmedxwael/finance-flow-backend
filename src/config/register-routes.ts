import { router } from "@/core";
import { importRoutes } from "@/routes";
import { log } from "@/shared/utils";
import { Express } from "express";

export async function registerRoutes(app: Express) {
  // Automatically import all routes.ts files from modules folder
  log.warn(`importing routes started ${performance.now()}`);
  await importRoutes();
  log.warn(`importing routes finished ${performance.now()}`);

  // Add the root route
  router.get("/", (_, res) => {
    res.json({ message: "Hello World" });
  });

  // Scan the routes and register them with Express
  router.scan(app);
}
