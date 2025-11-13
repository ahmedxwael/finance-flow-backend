import { MongoClient } from "mongodb";
import {
  __DEV__,
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_URL,
  DATABASE_USER,
} from "../../config/env";
import { log, logError } from "../../shared/utils";
import { Database, db } from "./db";

export function getDbUrl(host: string, port: string | number) {
  // In production, always use DATABASE_URL if available
  if (!__DEV__ && DATABASE_URL) {
    return DATABASE_URL;
  }
  // In development, use local connection
  return `mongodb://${host}:${port}`;
}

export class DBConnection {
  private static instance: DBConnection;

  private client: MongoClient | null = null;
  private clientDb: Database | null = null;
  /**
   * @description Private constructor to prevent direct instantiation
   */
  private constructor() {}

  /**
   * @description Get the database configuration
   * @returns The database configuration
   */
  private get dbConfig() {
    return {
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      username: DATABASE_USER,
      password: DATABASE_PASSWORD,
      databaseName: DATABASE_NAME,
    };
  }

  /**
   * @description Get the singleton instance of the DBConnection
   * @returns The singleton instance of the DBConnection
   */
  public static getInstance(): DBConnection {
    if (!DBConnection.instance) {
      DBConnection.instance = new DBConnection();
    }
    return DBConnection.instance;
  }

  /**
   * @description Connect to the database
   * @returns The connection instance
   */
  public async connect(): Promise<Database> {
    try {
      // Check if client exists and is still connected
      if (this.client && this.clientDb) {
        try {
          // Ping the database to check if connection is still alive
          await this.client.db().admin().ping();
          log.info("Database already connected");
          return this.clientDb;
        } catch {
          // Connection is dead, reset it
          log.warn("Database connection lost, reconnecting...");
          this.client = null;
          this.clientDb = null;
        }
      }

      const { host, port, username, password, databaseName } = this.dbConfig;

      // Get the connection URL
      const connectionUrl = getDbUrl(host, port);

      // Validate that we have a connection URL
      if (!connectionUrl) {
        const errorMsg = __DEV__
          ? `Database connection URL is not set. Please set DATABASE_HOST and DATABASE_PORT environment variables.`
          : `Database connection URL is not set. Please set DATABASE_URL environment variable for production.`;
        log.error(errorMsg, {
          __DEV__,
          DATABASE_URL: DATABASE_URL ? "***set***" : "not set",
          host,
          port,
        });
        throw new Error(errorMsg);
      }

      // Connection options optimized for serverless environments
      // If using DATABASE_URL (production), it usually includes auth in the URL
      // If using host:port (development), we need to provide auth separately
      const connectionOptions: any = {
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

      // Log connection attempt with sanitized URL (hide credentials)
      const sanitizedUrl = connectionUrl.replace(
        /\/\/([^:]+):([^@]+)@/,
        "//***:***@"
      );
      log.info("Attempting to connect to database...", {
        environment: __DEV__ ? "development" : "production",
        url: sanitizedUrl,
        timeout: `${connectionOptions.serverSelectionTimeoutMS}ms`,
      });

      this.client = await MongoClient.connect(connectionUrl, connectionOptions);

      // Set the database instance
      // If DATABASE_URL includes the database name, use it, otherwise use DATABASE_NAME
      const mongoDBDatabase = this.client.db(databaseName);
      this.clientDb = db.setDatabase(mongoDBDatabase);

      log.info(`Database connected successfully. db: ${databaseName}`);

      // Log a warning if the database connection is not secure (only in dev)
      if (__DEV__ && (!username || !password)) {
        log.warn("You're not making a secure database connection!");
      }

      return this.clientDb;
    } catch (error: any) {
      // Provide more helpful error messages
      if (
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("timeout") ||
        error.message?.includes("Server selection timed out")
      ) {
        const connectionUrl = getDbUrl(this.dbConfig.host, this.dbConfig.port);
        const sanitizedUrl =
          connectionUrl?.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@") ||
          "not set";

        const errorMsg = `Database connection failed. Please check:
1. DATABASE_URL is set correctly in environment variables
2. MongoDB server is accessible from your network
3. IP whitelist includes Vercel's IP ranges (if using MongoDB Atlas) - allow 0.0.0.0/0 for serverless
4. Connection string format is correct (should include auth if required)
5. Network connectivity and firewall settings
6. MongoDB service is running and accessible`;

        log.error(errorMsg, {
          error: error.message,
          connectionUrl: sanitizedUrl,
          environment: __DEV__ ? "development" : "production",
          hasDatabaseUrl: !!DATABASE_URL,
        });
      }
      logError(error);
      throw error;
    }
  }

  /**
   * @description Disconnect from the database
   * @returns The disconnection instance
   */
  public async disconnect(): Promise<void> {
    if (!this.client) {
      return log.info("Database already disconnected");
    }
    await this.client.close();
    this.client = null;
    this.clientDb = null;
    log.info("Database disconnected successfully");
  }
}

/**
 * @description The database connection instance
 */
const dbConnection = DBConnection.getInstance();

/**
 * @description Connect to the database
 * @returns The connection instance
 */
export async function connectToDB(): Promise<void> {
  await dbConnection.connect();
}

/**
 * @description Disconnect from the database
 * @returns The disconnection instance
 */
export async function disconnectFromDB(): Promise<void> {
  await dbConnection.disconnect();
}
