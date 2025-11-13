import { readdir } from "fs/promises";
import path from "path";

/**
 * Automatically imports all routes.ts files from the modules folder
 * This allows each module to define its own routes without manual registration
 */
export async function importRoutes() {
  try {
    // Get the src directory (works in both dev and production)
    // In dev: __dirname = src (when using ts-node-dev)
    // In production: __dirname = dist (compiled)
    const srcDir = __dirname.includes("dist")
      ? path.join(__dirname, "..", "src")
      : __dirname;
    const modulesDir = path.join(srcDir, "modules");

    // Recursively find all routes.ts files
    const findRouteFiles = async (dir: string): Promise<string[]> => {
      const files: string[] = [];
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively search in subdirectories
          const subFiles = await findRouteFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name === "routes.ts") {
          // Found a routes.ts file
          files.push(fullPath);
        }
      }

      return files;
    };

    const routeFiles = await findRouteFiles(modulesDir);

    // Import all route files in parallel for better performance
    // This is much faster than sequential imports, especially as routes grow
    // All imports happen concurrently, reducing total load time
    const importPromises = routeFiles.map((routeFile) => {
      // Convert absolute path to relative path from src directory
      // e.g., D:\...\src\modules\user\routes.ts -> modules/user/routes
      const relativePath = path.relative(
        srcDir,
        routeFile.replace(/\.ts$/, "")
      );

      // Convert Windows paths to forward slashes and use src/ prefix
      const normalizedPath = relativePath.replace(/\\/g, "/");
      // Use src/ prefix for cleaner imports (resolved by tsconfig-paths in dev, tsc-alias in build)
      const importPath = `src/${normalizedPath}`;

      // Dynamic import - routes register themselves when imported
      return import(importPath);
    });

    // Wait for all routes to be imported in parallel
    await Promise.all(importPromises);
  } catch (error) {
    console.error("Error importing routes:", error);
    throw error;
  }
}
