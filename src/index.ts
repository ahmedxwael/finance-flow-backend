import express from "express";
import { startApplication } from "./core";

// Create and configure Express app
const app = express();

// Start application
startApplication(app);

export default app;
