import express from "express";
import { PORT } from "../config/env";
import { registerRoutes } from "../config/register-routes";
import { errorHandler, notFoundHandler, staticFiles } from "../middlewares";
import { log, logError } from "../shared/utils";

export async function startServer(): Promise<void> {
  try {
    const app = express();

    // Middlewares
    app.use(staticFiles()); // Serve static files from the 'public' directory
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Register routes (imports all routes.ts files from modules)
    await registerRoutes(app);

    // Error handlers
    app.use(errorHandler);
    app.use(notFoundHandler);

    // Start server
    app.listen(PORT, () => {
      log.info(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}
