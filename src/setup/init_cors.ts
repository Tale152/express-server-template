import { Application } from 'express';
import cors from 'cors';
import { EnvVars } from './EnvVars';
import { AppError } from './middleware/errorHandler';

/**
 * Initializes CORS (Cross-Origin Resource Sharing) configuration for the Express application.
 * 
 * Configures CORS middleware with environment-specific origin validation:
 * - Development: Allows all origins for easier testing
 * - Production: Restricts to configured allowed origins
 * - Always allows requests without origin (mobile apps, server-to-server)
 * 
 * Features:
 * - Dynamic origin validation based on environment
 * - Credentials support for authenticated requests
 * - Comprehensive HTTP methods support
 * - Security headers configuration
 * 
 * @param app - Express application instance
 * @param envVars - Environment configuration containing CORS origins
 */
export function initCors(app: Application, envVars: EnvVars): void {
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (envVars.isDevelopment) {
        // In development, allow all origins
        return callback(null, true);
      } else if (envVars.CORS_ORIGIN.includes(origin)) {
        // In production, check against allowed origins
        return callback(null, true);
      }
      return callback(new AppError('Not allowed by CORS', 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };

  app.use(cors(corsOptions));
}
