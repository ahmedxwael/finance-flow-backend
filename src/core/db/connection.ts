import { MongoClient } from "mongodb";
import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
} from "src/config/env";
import { log, logError } from "src/shared/utils";
import { Database, db } from "./db";

export function getDbUrl(host: string, port: string | number) {
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

      this.client = await MongoClient.connect(getDbUrl(host, port), {
        auth: {
          username,
          password,
        },
      });

      // Set the database instance
      const mongoDBDatabase = this.client.db(databaseName);
      this.clientDb = db.setDatabase(mongoDBDatabase);

      log.info(`Database connected successfully. db: ${databaseName}`);

      // Log a warning if the database connection is not secure
      if (!username || !password) {
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
