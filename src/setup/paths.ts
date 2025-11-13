/**
 * Runtime path alias resolver for Vercel
 * This resolves src/ aliases at runtime without requiring tsconfig.json
 *
 * In Vercel, files are at /var/task/src/...
 * This overrides Node's module resolution to map src/ to the src directory
 */
import path from "path";

const currentDir = __dirname;

// Determine the src directory based on the current location
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
    const resolvedPath = path.resolve(srcDir, relativePath);

    try {
      // Try to resolve the path directly
      return originalResolveFilename.call(
        this,
        resolvedPath,
        parent,
        isMain,
        options
      );
    } catch (err: any) {
      // If direct resolution fails, try with .js extension
      try {
        return originalResolveFilename.call(
          this,
          resolvedPath + ".js",
          parent,
          isMain,
          options
        );
      } catch {
        // If that also fails, throw the original error
        throw err;
      }
    }
  }

  // For non-src/ imports, use the original resolver
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
