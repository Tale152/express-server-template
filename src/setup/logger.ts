import winston from 'winston';
import expressWinston from 'express-winston';
import { EnvVars } from './EnvVars';
import * as fs from 'fs';
import * as path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Common file format for production logs
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
);

/**
 * Creates the main application logger instance.
 * 
 * Configures Winston logger with environment-specific transports and formats.
 * In development, logs to console with colorized output. In production, adds
 * file logging with rotation and exception handling.
 * 
 * Features:
 * - Console logging with human-readable format
 * - File logging in production (combined, error, exceptions, rejections)
 * - Log rotation with size limits (5MB per file, 5 files retained)
 * - Different log levels per environment (debug in dev, info in prod)
 * 
 * @param envVars - Environment configuration for logger setup
 * @returns Configured Winston logger instance
 */
export function createLogger(envVars: EnvVars) {
  // Create transports based on environment
  const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
      level: envVars.isProduction ? 'info' : 'debug',
      format: consoleFormat,
    }),
  ];

  // Add file transports only in production and if logs directory exists
  if (envVars.isProduction && fs.existsSync(logsDir)) {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
  }

  // Create logger instance
  const logger = winston.createLogger({
    level: envVars.isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports,
    // Only add exception handlers in production
    ...(envVars.isProduction && fs.existsSync(logsDir) ? {
      exceptionHandlers: [
        new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
      ],
    } : {}),
  });

  return logger;
}

/**
 * Creates HTTP request logging middleware.
 * 
 * Logs all incoming HTTP requests with method, URL, and response time.
 * Automatically ignores health check and documentation routes to reduce noise.
 * 
 * @param logger - Winston logger instance for HTTP request logging
 * @returns Express middleware for HTTP request logging
 */
export function createHttpLogger(logger: winston.Logger) {
  // HTTP request logging middleware
  return expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: (req, _res) => {
      // Ignore to reduce noise
      return req.url === '/health' || req.url.startsWith('/docs');
    },
  });
}

/**
 * Creates HTTP error logging middleware.
 * 
 * Logs HTTP errors with detailed request information including headers,
 * body, and query parameters for debugging purposes. Should be placed
 * after routes but before the final error handler.
 * 
 * @param logger - Winston logger instance for HTTP error logging
 * @returns Express middleware for HTTP error logging
 */
export function createHttpErrorLogger(logger: winston.Logger) {
  // HTTP error logging middleware
  return expressWinston.errorLogger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP Error {{req.method}} {{req.url}}',
    requestWhitelist: ['url', 'headers', 'method', 'body', 'query'],
  });
}
