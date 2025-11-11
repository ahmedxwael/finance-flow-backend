import mongoose from "mongoose";
import { log, logError } from "../utils";
import {
  __DEV__,
  DATABASE_LOCAL_URL,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_URL,
  DATABASE_USER,
} from "./env";

export const connectToDB = async () => {
  const URL = __DEV__ ? DATABASE_LOCAL_URL : DATABASE_URL;
  const NAME = DATABASE_NAME;

  try {
    if (!URL) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please check your .env file."
      );
    }

    await mongoose.connect(URL, {
      dbName: NAME,
      auth: {
        username: DATABASE_USER,
        password: DATABASE_PASSWORD,
      },
    });
    log.info(`Database Connected Successfully!`);
  } catch (err) {
    logError(err, {
      url: URL,
      name: NAME,
    });
    process.exit(1);
  }
};
