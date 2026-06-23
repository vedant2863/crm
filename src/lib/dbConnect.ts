import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose!;

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
