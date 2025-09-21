import 'reflect-metadata';
import { Application } from 'express';
import mongoose from 'mongoose';
import { createApp, EnvVars } from '../../src/app';
import { ContainerDAOMongoDB } from '../../src/domain/mongodb/ContainerDAOMongoDB';
import { DatabaseConnectionMongoDB } from '../../src/domain/mongodb/DatabaseConnectionMongoDB';
import { MongoDBSessionProducer } from '../../src/domain/mongodb/MongoDBSessionProducer';
import { TimestampProducer } from '../../src/utils/TimestampProducer';
import winston from 'winston';

declare global {
  var __MONGO_URI__: string;
}

export interface IntegrationTestContext {
  app: Application;
  envVars: EnvVars;
  containerDAO: ContainerDAOMongoDB;
  dbConnection: DatabaseConnectionMongoDB;
  logger: winston.Logger;
}

/**
 * Sequential timestamp producer for tests to ensure unique timestamps
 * Prevents conflicts in tests that run too quickly
 */
class SequentialTimestampProducer implements TimestampProducer {
  private currentTimestamp: number;

  constructor(baseTimestamp: number = Date.now()) {
    this.currentTimestamp = baseTimestamp;
  }

  getNow(): number {
    return ++this.currentTimestamp;
  }
}

/**
 * Setup integration test environment with shared MongoDB connection
 */
export async function setupIntegrationTest(): Promise<IntegrationTestContext> {
  // Use the global MongoDB URI from globalSetup
  const mongoUri = (globalThis as typeof globalThis & { __MONGO_URI__: string }).__MONGO_URI__;
  
  if (!mongoUri) {
    throw new Error('Global MongoDB URI not found. Make sure globalSetup is configured.');
  }

  // Create test environment variables
  const envVars = createTestEnvVars(mongoUri);
  
  // Create logger for tests (silent)
  const logger = createTestLogger();

  // Initialize dependencies
  const containerDAO = new ContainerDAOMongoDB();
  const dbConnection = new DatabaseConnectionMongoDB();
  const dbSessionProducer = new MongoDBSessionProducer();
  const timestampProducer = new SequentialTimestampProducer();

  // Connect to test database (reuse existing connection if available)
  if (mongoose.connection.readyState !== 1) {
    await dbConnection.connect(envVars, logger);
  }

  // Create app
  const app = await createApp(envVars, containerDAO, dbSessionProducer, timestampProducer, logger);

  return {
    app,
    envVars,
    containerDAO,
    dbConnection,
    logger,
  };
}

/**
 * Clear all data from test database (optional - use only when explicitly needed)
 */
export async function clearTestDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      // Drop the entire database to ensure clean state
      await mongoose.connection.db.dropDatabase();
    }
  } catch (error) {
    console.warn('Warning: Could not clear test database:', error);
    // Continue anyway - the test might still work
  }
}

/**
 * Create test environment variables (reused from globalSetup logic)
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

/**
 * Create a silent logger for tests
 */
function createTestLogger(): winston.Logger {
  return winston.createLogger({
    level: 'error', // Only log errors in tests
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console({
        silent: process.env.NODE_ENV === 'test', // Silent during tests
      }),
    ],
  });
}

/**
 * Wait for database to be ready
 */
export async function waitForDatabase(maxAttempts: number = 10): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(`Database not ready after ${maxAttempts} attempts: ${error}`);
      }
    }
  }
}
