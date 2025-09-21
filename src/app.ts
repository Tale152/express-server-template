import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import winston from 'winston';

import { createRouter } from './controllers/routes';
import { EnvVars } from './setup/EnvVars';
import { initCors } from './setup/init_cors';
import { setupSwaggerUi } from './setup/swagger';
import { createHttpLogger, createHttpErrorLogger } from './setup/logger';
import { createErrorHandler, notFoundHandler } from './setup/middleware/errorHandler';
import { createRateLimiters } from './setup/middleware/rateLimiters';
import { createCompressionMiddleware } from './setup/middleware/compression';
import { sanitizeInput } from './setup/middleware/inputSanitization';
import { ContainerDAO } from './domain/interfaces/ContainerDAO';
import { DatabaseSessionProducer } from './domain/interfaces/DatabaseSessionProducer';
import { TimestampProducer } from './utils/TimestampProducer';

/**
 * Creates and configures the Express.js application with all necessary middleware and routes.
 * 
 * This factory function sets up a complete Express application with security, logging,
 * validation, rate limiting, response compression, and API documentation. The middleware 
 * stack is carefully ordered to ensure proper request processing and error handling.
 * 
 * @param envVars - Environment variables configuration
 * @param containerDAO - Container for all DAO instances
 * @param dbSessionProducer - Database session producer for transactions
 * @param timestampProducer - Timestamp producer for consistent time handling
 * @param logger - Winston logger instance for application logging
 * @returns Configured Express application ready to start
 */
export async function createApp(
  envVars: EnvVars, 
  containerDAO: ContainerDAO<unknown>,
  dbSessionProducer: DatabaseSessionProducer<unknown>,
  timestampProducer: TimestampProducer,
  logger: winston.Logger
): Promise<Application> {
  const app: Application = express();

  const httpLogger = createHttpLogger(logger);
  const httpErrorLogger = createHttpErrorLogger(logger);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        scriptSrc: ['\'self\''],
        imgSrc: ['\'self\'', 'data:', 'https:'],
      },
    },
  }));

  // Response compression
  app.use(createCompressionMiddleware(envVars));

  // Setup CORS
  initCors(app, envVars);

  // Rate limiting
  const { generalLimiter, speedLimiter } = createRateLimiters(envVars);
  app.use(generalLimiter);
  app.use(speedLimiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Input sanitization
  app.use(sanitizeInput);

  // Logging with Winston
  app.use(httpLogger);

  // Static files and cookies
  app.use(express.static('public'));
  app.use(cookieParser());
  app.set('trust proxy', 1);

  // Setup Swagger documentation
  setupSwaggerUi(app);

  // Routes
  app.use(createRouter(envVars, containerDAO, dbSessionProducer, timestampProducer));

  // Error handling middleware (must be last)
  app.use(httpErrorLogger);
  app.use(notFoundHandler);
  app.use(createErrorHandler(envVars));

  return app;
}

export { EnvVars };
