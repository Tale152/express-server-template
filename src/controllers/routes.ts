import { Router } from 'express';
import { registerHealthRoutes } from './health/routes';
import { registerAuthRoutes } from './auth/routes';
import { registerProjectRoutes } from './project/routes';
import { EnvVars } from '../setup/EnvVars';
import { ContainerDAO } from '../domain/interfaces/ContainerDAO';
import { DatabaseSessionProducer } from '../domain/interfaces/DatabaseSessionProducer';
import { TimestampProducer } from '../utils/TimestampProducer';

/**
 * Creates and configures the main application router with all route modules
 * 
 * @param envVars - Environment variables configuration
 * @param containerDAO - Container for all DAO instances
 * @param databaseSessionProducer - Producer for database sessions (required for transactional operations)
 * @param timestampProducer - Producer for consistent timestamps across the application
 * @returns Configured Express router with all application routes
 */
export function createRouter(
  envVars: EnvVars, 
  containerDAO: ContainerDAO<unknown>,
  databaseSessionProducer: DatabaseSessionProducer<unknown>,
  timestampProducer: TimestampProducer
): Router {
  const router = Router();

  // Health check routes (no authentication required)
  registerHealthRoutes(router, envVars, containerDAO);
  
  // Authentication routes (user registration, login, logout, token management)
  registerAuthRoutes(router, envVars, containerDAO, databaseSessionProducer, timestampProducer);
  
  // Project management routes (requires authentication)
  registerProjectRoutes(router, envVars, containerDAO, databaseSessionProducer, timestampProducer);

  return router;
}
