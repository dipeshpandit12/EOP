
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
let cached: MongooseCache = (global as { mongoose?: MongooseCache }).mongoose as MongooseCache;

if (!cached) {
  (global as { mongoose?: MongooseCache }).mongoose = { conn: null, promise: null }
  cached = (global as { mongoose?: MongooseCache }).mongoose as MongooseCache
}

export async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
