import { EnvVars } from '../src/app';
import { DatabaseConnectionMongoDB } from '../src/domain/mongodb/DatabaseConnectionMongoDB';
import { createLogger } from '../src/setup/logger';
import mongoose from 'mongoose';

declare global {
  var __MONGO_URI__: string;
}

export default async function globalSetup() {
  // MongoDB URI for test container (should be running on port 27017)
  const mongoUri = 'mongodb://localhost:27017/test-db?replicaSet=rs0';
  
  // Store the URI in a global variable that tests can access
  const globals = globalThis as typeof globalThis & { __MONGO_URI__: string };
  globals.__MONGO_URI__ = mongoUri;
  
  try {
    console.log('Connecting to test database...');
    console.log('Make sure to run: npm run mongo:test:start');
    
    // Create test environment variables
    const envVars = createTestEnvVars(mongoUri);
    
    // Create logger for setup operations
    const logger = createLogger(envVars);
    
    // Use DatabaseConnectionMongoDB class for consistency with main app
    const dbConnection = new DatabaseConnectionMongoDB();
    
    // Connect to the test database using our architecture
    await dbConnection.connect(envVars, logger);
    
    // Clear the database to ensure clean state for each test run
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      logger.info('Test database cleared for fresh test run');
    }
    
    // Disconnect after setup (tests will create their own connections)
    await dbConnection.disconnect(envVars, logger);
    
    console.log('Test database setup completed successfully');
  } catch (error) {
    console.error('❌ Failed to connect to test database');
    console.error('Make sure the test container is running: npm run mongo:test:start');
    console.error('Error details:', error);
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
