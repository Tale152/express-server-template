import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { EnvVars } from '../src/app';
import { DatabaseConnectionMongoDB } from '../src/domain/mongodb/DatabaseConnectionMongoDB';
import { createLogger } from '../src/setup/logger';
import mongoose from 'mongoose';

declare global {
  var __MONGO_URI__: string;
  var __MONGO_DB__: MongoMemoryReplSet;
}

export default async function globalSetup() {
  const mongoServer = await MongoMemoryReplSet.create({
    replSet: {
      count: 1, // Single node replica set
      dbName: 'test-db',
      storageEngine: 'wiredTiger',
    },
    instanceOpts: [
      {
        storageEngine: 'wiredTiger',
        port: undefined, // Let it choose a port
      },
    ],
  });

  const mongoUri = mongoServer.getUri();
  
  // Add a small delay to ensure the replica set is fully ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Store the URI in a global variable that tests can access
  const globals = globalThis as typeof globalThis & { 
    __MONGO_URI__: string; 
    __MONGO_DB__: MongoMemoryReplSet 
  };
  globals.__MONGO_URI__ = mongoUri;
  globals.__MONGO_DB__ = mongoServer;
  
  // Create test environment variables (similar to integration setup)
  const envVars = createTestEnvVars(mongoUri);
  
  // Create logger for setup operations
  const logger = createLogger(envVars);
  
  // Use DatabaseConnectionMongoDB class for consistency with main app
  const dbConnection = new DatabaseConnectionMongoDB();
  
  try {
    // Connect to the test database using our architecture
    await dbConnection.connect(envVars, logger);
    
    // Clear the database to ensure clean state for each test run
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      logger.info('Test database cleared for fresh test run');
    }
    
    // Disconnect after setup (tests will create their own connections)
    await dbConnection.disconnect(envVars, logger);
    
    console.log('Global MongoDB Memory Server started:', mongoUri);
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  }
}

/**
 * Create test environment variables for global setup
 */
function createTestEnvVars(mongoUri: string): EnvVars {
  // Backup original env vars
  const originalEnv = { ...process.env };
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.SERVER_NAME = 'Test Server';
  process.env.CORS_ORIGIN = 'http://localhost:3001';
  process.env.DATABASE_URL = mongoUri;
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-do-not-use-in-production';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only-do-not-use-in-production';
  process.env.JWT_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  
  const envVars = new EnvVars();
  
  // Restore original env vars
  process.env = originalEnv;
  
  return envVars;
}
