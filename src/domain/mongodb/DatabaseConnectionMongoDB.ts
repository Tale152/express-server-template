import mongoose from 'mongoose';
import { DatabaseConnection } from '../interfaces/DatabaseConnection';
import { EnvVars } from '../../setup/EnvVars';
import winston from 'winston';
import { MongoClient } from 'mongodb';

/**
 * MongoDB implementation of the DatabaseConnection interface
 * 
 * Manages MongoDB database connectivity using Mongoose ODM with optimized
 * connection pooling, error handling, and lifecycle management.
 * 
 * Features:
 * - Connection pooling with configurable limits
 * - Automatic reconnection handling
 * - Comprehensive error logging and monitoring
 * - Graceful connection lifecycle management
 * - Native MongoDB client access for advanced operations
 * 
 * @implements {DatabaseConnection}
 */
export class DatabaseConnectionMongoDB implements DatabaseConnection {
  private isConnected: boolean = false;

  /**
   * Get the native MongoDB client from mongoose connection
   * 
   * Provides access to the underlying MongoDB client for operations
   * that require direct database access beyond Mongoose ODM capabilities.
   * 
   * @returns {MongoClient | null} MongoDB client instance or null if not connected
   */
  public getMongoClient(): MongoClient | null {
    if (!this.isConnected || !mongoose.connection.db) {
      return null;
    }
    return mongoose.connection.getClient();
  }

  /**
   * Establish connection to MongoDB database
   * 
   * Initializes MongoDB connection using Mongoose with optimized configuration
   * for production use including connection pooling, timeouts, and error handling.
   * 
   * Connection Configuration:
   * - maxPoolSize: 10 connections for optimal performance
   * - serverSelectionTimeoutMS: 5 seconds for server discovery
   * - socketTimeoutMS: 45 seconds for socket operations
   * 
   * @param {EnvVars} envVars - Environment configuration containing DATABASE_URL
   * @param {winston.Logger} logger - Logger instance for connection events
   * @returns {Promise<void>} Resolves when connection is established
   * 
   * @throws {Error} If connection fails or DATABASE_URL is invalid
   */
  public async connect(envVars: EnvVars, logger: winston.Logger): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    const mongoUri = envVars.DATABASE_URL;

    try {
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      logger.info('Connected to MongoDB at ' + mongoUri);

      // Set up connection event listeners for monitoring
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error at ' + mongoUri + ':', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected from ' + mongoUri);
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected at ' + mongoUri);
        this.isConnected = true;
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB at ' + mongoUri + ':', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB database
   * 
   * Gracefully closes the MongoDB connection and cleans up resources.
   * Safe to call multiple times - no-op if already disconnected.
   * 
   * @param {EnvVars} envVars - Environment configuration (unused but required by interface)
   * @param {winston.Logger} logger - Logger instance for disconnection events
   * @returns {Promise<void>} Resolves when disconnection is complete
   * 
   * @throws {Error} If disconnection process encounters errors
   */
  public async disconnect(envVars: EnvVars, logger: winston.Logger): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get current connection state
   * 
   * Returns the current database connection status.
   * Useful for health checks and application monitoring.
   * 
   * @param {EnvVars} _envVars - Environment configuration (unused but required by interface)
   * @param {winston.Logger} _logger - Logger instance (unused but required by interface)
   * @returns {boolean} true if connected, false otherwise
   */
  public getConnectionState(_envVars: EnvVars, _logger: winston.Logger): boolean {
    return this.isConnected;
  }
}
