import express, { Express } from "express";
import { registerRoutes } from "../config";
import { PORT } from "../config/env";
import { errorHandler, notFoundHandler, staticFiles } from "../middlewares";
import { log, logError } from "../shared/utils";

/**
 * Start the server (for local development)
 */
export async function startServer(app: Express): Promise<void> {
  try {
    app.use(staticFiles());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Register routes (imports all routes.ts files from modules)
    await registerRoutes(app);

    // Error handlers
    app.use(errorHandler);
    app.use(notFoundHandler);

    app.listen(PORT, () => {
      log.info(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}
