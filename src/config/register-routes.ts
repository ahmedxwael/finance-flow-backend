import { Express } from "express";
import { router } from "../core";
import { importRoutes } from "../routes";
import { log } from "../shared/utils";

export async function registerRoutes(app: Express) {
  try {
    // Automatically import all routes.ts files from modules folder
    await importRoutes();

    // Add the root route
    router.get("/", (_, res) => {
      res.json({ message: "Hello World" });
    });

    // Scan the routes and register them with Express
    router.scan(app);

    const routes = router.getRoutes();
    log.info(`Registered ${routes.length} route(s)`);
  } catch (error) {
    log.error("Failed to register routes:", error);
    throw error;
  }
}
