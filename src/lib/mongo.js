import mongoose from "mongoose";

/** Prefer MONGODB_URL; also accept MONGODB_URI (common Atlas / Vercel naming). */
const uri = process.env.MONGODB_URL || process.env.MONGODB_URI;

/** Reuse connection across hot reloads and concurrent API routes (Next.js pattern). */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connection = async () => {
  if (!uri) {
    throw new Error("MONGODB_URL or MONGODB_URI is not set");
  }
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri);
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connection;
