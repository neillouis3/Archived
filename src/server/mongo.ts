import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error('MONGODB_URI missing');

let cached = (global as any).__mongoose;
if (!cached) cached = (global as any).__mongoose = { conn: null as typeof mongoose | null, promise: null as Promise<typeof mongoose> | null };

export async function mongoConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(uri).then(m => m);
  cached.conn = await cached.promise;
  return cached.conn;
}
