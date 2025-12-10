import mongoose from 'mongoose';
import { getMongoDBUri } from '../config/secrets';

let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Connect to MongoDB Atlas
 * Uses connection pooling and caches the connection across Lambda invocations
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing database connection');
    return mongoose;
  }

  // Return in-progress connection if exists
  if (connectionPromise) {
    console.log('Waiting for existing connection attempt');
    return connectionPromise;
  }

  try {
    // Get MongoDB URI from Secrets Manager or environment variable
    const MONGODB_URI = await getMongoDBUri();
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not available');
    }

    console.log('Creating new database connection');
    
    // Create new connection with proper options
    connectionPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 10000,
    });

    const mongooseInstance = await connectionPromise;
    isConnected = true;
    connectionPromise = null;

    console.log('MongoDB connected successfully');
    return mongooseInstance;
  } catch (error) {
    connectionPromise = null;
    isConnected = false;
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB (useful for testing)
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  connectionPromise = null;
  console.log('MongoDB disconnected');
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
