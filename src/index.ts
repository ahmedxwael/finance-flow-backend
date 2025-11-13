import express from "express";
import { startApplication } from "./core";
import { staticFiles } from "./middlewares";

const app = express();

// Middlewares
app.use(staticFiles()); // Serve static files from the 'public' directory
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

startApplication(app);

export default app;
