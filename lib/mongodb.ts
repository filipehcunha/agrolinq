// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the DATABASE_URL or MONGODB_URI environment variable inside .env.local'
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

type GlobalWithMongoose = typeof globalThis & {
  mongoose?: MongooseCache;
};

const globalWithMongoose = globalThis as GlobalWithMongoose;

const cached: MongooseCache = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.mongoose = cached;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Desativa o buffer
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;