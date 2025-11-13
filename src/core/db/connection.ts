import { MongoClient } from "mongodb";
import { getConnectionOptions } from "../../config";
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

// Helper functions
function buildConnectionUrl(): string {
  if (!__DEV__ && DATABASE_URL) {
    return DATABASE_URL;
  }
  return `mongodb://${DATABASE_HOST}:${DATABASE_PORT}`;
}

function sanitizeUrl(url: string): string {
  return url.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
}

function validateConnectionUrl(url: string | null): void {
  if (!url) {
    const message = __DEV__
      ? "Database connection URL is not set. Please set DATABASE_HOST and DATABASE_PORT environment variables."
      : "Database connection URL is not set. Please set DATABASE_URL environment variable for production.";
    log.error(message);
    throw new Error(message);
  }
}

async function isConnectionAlive(client: MongoClient): Promise<boolean> {
  try {
    await client.db().admin().ping();
    return true;
  } catch {
    return false;
  }
}

export class DBConnection {
  private static instance: DBConnection;
  private client: MongoClient | null = null;
  private clientDb: Database | null = null;

  private constructor() {}

  public static getInstance(): DBConnection {
    if (!DBConnection.instance) {
      DBConnection.instance = new DBConnection();
    }
    return DBConnection.instance;
  }

  public async connect(): Promise<Database> {
    try {
      // Reuse existing connection if alive
      if (
        this.client &&
        this.clientDb &&
        (await isConnectionAlive(this.client))
      ) {
        log.info("Database already connected");
        return this.clientDb;
      }

      // Reset dead connection
      if (this.client) {
        log.warn("Database connection lost, reconnecting...");
        this.reset();
      }

      // Build and validate connection URL
      const connectionUrl = buildConnectionUrl();
      validateConnectionUrl(connectionUrl);

      // Connect to database
      const options = getConnectionOptions(DATABASE_USER, DATABASE_PASSWORD);
      log.info(
        `Connecting to database... [${__DEV__ ? "dev" : "prod"}] ${sanitizeUrl(connectionUrl)}`
      );

      this.client = await MongoClient.connect(connectionUrl, options);
      this.clientDb = db.setDatabase(this.client.db(DATABASE_NAME));

      log.info(`Database connected successfully. db: ${DATABASE_NAME}`);

      if (__DEV__ && (!DATABASE_USER || !DATABASE_PASSWORD)) {
        log.warn("You're not making a secure database connection!");
      }

      return this.clientDb;
    } catch (error) {
      logError(error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.client) {
      log.info("Database already disconnected");
      return;
    }

    await this.client.close();
    this.reset();
    log.info("Database disconnected successfully");
  }

  private reset(): void {
    this.client = null;
    this.clientDb = null;
  }
}

// Singleton instance
const dbConnection = DBConnection.getInstance();

// Public API
export async function connectToDB(): Promise<void> {
  await dbConnection.connect();
}

export async function disconnectFromDB(): Promise<void> {
  await dbConnection.disconnect();
}
