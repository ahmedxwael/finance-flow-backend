import { MongoClientOptions } from "mongodb";
import { __DEV__ } from "./env";

/**
 * @description Get MongoDB connection options optimized for serverless environments
 * @param username Optional username for authentication (development mode)
 * @param password Optional password for authentication (development mode)
 * @returns MongoDB client connection options
 */
export function getConnectionOptions(
  username?: string,
  password?: string
): MongoClientOptions {
  // Connection options optimized for serverless environments
  // If using DATABASE_URL (production), it usually includes auth in the URL
  // If using host:port (development), we need to provide auth separately
  const connectionOptions: MongoClientOptions = {
    // Serverless-optimized connection options
    // Increased timeouts for serverless environments where network latency can be higher
    serverSelectionTimeoutMS: 30000, // 30 seconds (increased for serverless)
    connectTimeoutMS: 30000, // 30 seconds (increased for serverless)
    socketTimeoutMS: 45000, // 45 seconds
    // Connection pool settings for serverless
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 0, // Allow pool to shrink to 0 for serverless (connections close after inactivity)
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    // Retry settings
    retryWrites: true,
    retryReads: true,
    // Heartbeat settings to keep connection alive
    heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
  };

  // Only add auth if not using a full connection string (development mode)
  if (__DEV__ && username && password) {
    connectionOptions.auth = {
      username,
      password,
    };
  }

  return connectionOptions;
}

