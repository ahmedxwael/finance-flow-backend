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
      if (this.client && this.clientDb) {
        log.info("Database already connected");
        return this.clientDb;
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

      // Log connection info (without sensitive data)
      if (__DEV__) {
        log.info(`Connecting to database at ${host}:${port}`);
      } else {
        log.info(`Connecting to database using DATABASE_URL`);
      }

      // Connection options
      // If using DATABASE_URL (production), it usually includes auth in the URL
      // If using host:port (development), we need to provide auth separately
      const connectionOptions: any = {};

      // Only add auth if not using a full connection string (development mode)
      if (__DEV__ && username && password) {
        connectionOptions.auth = {
          username,
          password,
        };
      }

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
    } catch (error) {
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
