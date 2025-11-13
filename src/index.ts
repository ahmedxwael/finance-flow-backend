// Setup path aliases for Vercel runtime (before any other imports)
// This registers tsconfig paths at runtime
import "tsconfig-paths/register";
import { startApplication } from "./core";

startApplication();
