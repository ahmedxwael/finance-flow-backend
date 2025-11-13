/**
 * Runtime path alias resolver for Vercel
 * This resolves src/ aliases at runtime without requiring tsconfig.json
 *
 * In Vercel, files are at /var/task/src/...
 * This overrides Node's module resolution to map src/ to the src directory
 */
import path from "path";

// Get the directory where this file is located
const currentDir = __dirname;

// Determine the src directory based on the current location
// In Vercel: /var/task/src/setup/paths.js -> srcDir = /var/task/src
// In local build: dist/setup/paths.js -> srcDir = src (relative to dist)
// In development: src/setup/paths.ts -> srcDir = src
let srcDir: string;
if (currentDir.includes("var/task")) {
  // Vercel production: /var/task/src/setup/paths.js -> /var/task/src
  srcDir = path.resolve(currentDir, "..");
} else if (currentDir.includes("dist")) {
  // Local production build: dist/setup/paths.js -> src
  srcDir = path.resolve(currentDir, "..", "src");
} else {
  // Development: src/setup/paths.ts -> src
  srcDir = path.resolve(currentDir, "..");
}

// Normalize the path to handle any inconsistencies
srcDir = path.normalize(srcDir);

const Module = require("module");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (
  request: string,
  parent: any,
  isMain: boolean,
  options: any
) {
  // Only handle src/ prefixed imports
  if (request.startsWith("src/")) {
    const relativePath = request.replace(/^src\//, "");
    // Resolve to absolute path: src/config/env -> /var/task/src/config/env
    const resolvedPath = path.resolve(srcDir, relativePath);

    // Let Node's resolver handle the path resolution (it knows about .js extensions, index files, etc.)
    try {
      return originalResolveFilename.call(
        this,
        resolvedPath,
        parent,
        isMain,
        options
      );
    } catch (err: any) {
      // If resolution fails, provide a helpful error message
      throw new Error(
        `Cannot resolve module '${request}' from '${parent?.filename || "unknown"}'. ` +
          `Resolved to: ${resolvedPath}. ` +
          `Source directory: ${srcDir}. ` +
          `Original error: ${err.message}`
      );
    }
  }

  // For non-src/ imports, use the original resolver
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
