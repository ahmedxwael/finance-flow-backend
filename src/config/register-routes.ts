import { router } from "@/core";
import { importRoutes } from "@/routes";
import { Express } from "express";

export async function registerRoutes(app: Express) {
  // Automatically import all routes.ts files from modules folder
  await importRoutes();

  // Add the root route
  router.get("/", (_, res) => {
    res.json({ message: "Hello World" });
  });

  // Scan the routes and register them with Express
  router.scan(app);
}
