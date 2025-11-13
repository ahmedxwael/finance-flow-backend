import express from "express";
import { setupAppInitialization } from "./core";

// Create Express app
const app = express();

// Setup app initialization based on environment
setupAppInitialization(app);

export default app;
