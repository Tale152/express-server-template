import { EnvVars } from '../../setup/EnvVars';
import winston from 'winston';

/**
 * Database connection abstraction interface
 * 
 * This interface provides a database technology agnostic way to manage
 * database connections. Implementations can handle MongoDB, PostgreSQL,
 * MySQL, or any other database technology while providing a consistent
 * interface for connection lifecycle management.
 * 
 * The interface ensures that the application can switch between different
 * database technologies without changing the connection management logic
 * in the main application flow.
 */
export interface DatabaseConnection {
  /**
   * Establish connection to the database
   * 
   * Implementations should handle database-specific connection logic,
   * authentication, connection pooling, and initial setup.
   * 
   * @param envVars Environment variables configuration containing connection details
   * @param logger Logger instance for logging database connection events
   * @throws Error if connection fails
   */
  connect(envVars: EnvVars, logger: winston.Logger): Promise<void>;

  /**
   * Close connection to the database
   * 
   * Implementations should handle graceful disconnection, cleanup of
   * resources, and proper connection pool shutdown.
   * 
   * @param envVars Environment variables configuration
   * @param logger Logger instance for logging database disconnection events
   * @throws Error if disconnection fails
   */
  disconnect(envVars: EnvVars, logger: winston.Logger): Promise<void>;

  /**
   * Check the current connection state
   * 
   * Implementations should provide real-time connection status without
   * performing expensive operations.
   * 
   * @param envVars Environment variables configuration
   * @param logger Logger instance for logging connection state checks
   * @returns true if database is connected and ready, false otherwise
   */
  getConnectionState(envVars: EnvVars, logger: winston.Logger): boolean;
}
