/**
 * @file src/lib/dbConnect.ts
 * @description Mongoose connection manager with global caching to prevent multiple active connection promises in serverless environments.
 */

import mongoose from "mongoose";
import envConfig from "@/lib/config/envconfig";

const MONGODB_URI = envConfig.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose!;

/**
 * Establishes a cached connection to MongoDB using Mongoose.
 * Prevents multiple concurrent connection promises in serverless contexts.
 * 
 * @returns {Promise<void>} Resolves when connection succeeds
 * @throws {Error} If connection fails
 */
async function dbConnect(): Promise<void> {
  if (cached.conn) {
    return;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("Database connection failed:", error);
    throw error;
  }
}

export default dbConnect;
