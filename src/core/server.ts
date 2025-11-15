import express, { Express } from "express";
import path from "path";
import favicon from "serve-favicon";
import { registerRoutes } from "../config";
import { PORT, __DEV__ } from "../config/env";
import { errorHandler, notFoundHandler, staticFiles } from "../middlewares";
import { getAllowedUploadsPath, log, logError } from "../shared/utils";

/**
 * Setup middlewares for the Express app
 */
async function setupMiddlewares(app: Express): Promise<void> {
  app.use(staticFiles());
  // Serve uploaded files from the allowed uploads directory
  // Uses getAllowedUploadsPath() for consistency with security checks
  app.use("/uploads", express.static(getAllowedUploadsPath()));
  app.use(favicon(path.join(__dirname, "..", "public", "favicon.ico")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

/**
 * Setup error handlers (must be after routes)
 */
function setupErrorHandlers(app: Express): void {
  app.use(errorHandler);
  app.use(notFoundHandler);
}

/**
 * Register routes and setup error handlers
 */
export async function setupApp(app: Express): Promise<void> {
  await setupMiddlewares(app);
  await registerRoutes(app);
  setupErrorHandlers(app);
}

/**
 * Start the server (for local development only)
 */
export async function startServer(app: Express): Promise<void> {
  try {
    await setupApp(app);

    if (__DEV__) {
      app.listen(PORT, () => {
        log.info(`Server is running on port http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}
