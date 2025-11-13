// Setup path aliases for Vercel runtime (before any other imports)
// This resolves src/ aliases at runtime without requiring tsconfig.json
import { startApplication } from "./core";
import "./setup/paths";

startApplication();
