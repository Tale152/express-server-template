import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
  var __MONGO_URI__: string;
  var __MONGO_DB__: MongoMemoryReplSet;
}

export default async function globalTeardown() {
  const mongoServer = (globalThis as typeof globalThis & { __MONGO_DB__: MongoMemoryReplSet }).__MONGO_DB__;
  
  try {
    // Disconnect mongoose if still connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Mongoose disconnected');
    }
    
    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
      console.log('Global MongoDB Memory Server stopped');
    }
  } catch (error) {
    console.error('Error during global teardown:', error);
  }
}
