import { __DEV__ } from "@/config/env";
import express from "express";
import path from "path";

/**
 * Middleware to serve static files from the public directory
 * @param publicPath - Path to the public directory (default: "public")
 * @returns Express middleware
 */
export const staticFiles = (publicPath: string = "public") => {
  const staticPath = path.join(__dirname, "..", publicPath);

  return express.static(staticPath, {
    // Options for static file serving
    maxAge: __DEV__ ? "0" : "1y", // Cache in production
    etag: true, // Enable ETag for caching
    lastModified: true, // Enable Last-Modified header
    index: false, // Don't serve index.html automatically
    dotfiles: "ignore", // Ignore dotfiles
  });
};
