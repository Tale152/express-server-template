import { Request, Response, NextFunction } from 'express';
import { EnvVars } from '../EnvVars';
import { DatabaseSessionProducer } from '../../domain/interfaces/DatabaseSessionProducer';
import { DatabaseSession } from '../../domain/interfaces/DatabaseSession';

/**
 * Extended Error interface for API-specific error handling.
 */
export interface ApiError extends Error {
  /** HTTP status code for the error */
  statusCode?: number;
  
  /** Whether this is an operational error (expected) vs programming error */
  isOperational?: boolean;
}

/**
 * MongoDB-specific error interface for database error handling.
 */
export interface MongoError extends Error {
  /** MongoDB error code */
  code?: number;
  
  /** Pattern of the unique key that caused the error */
  keyPattern?: Record<string, unknown>;
  
  /** Value of the key that caused the error */
  keyValue?: Record<string, unknown>;
}

/**
 * Custom application error class for consistent error handling.
 * 
 * Extends the standard Error class with HTTP status codes and operational
 * flags to distinguish between expected business logic errors and
 * unexpected programming errors.
 */
export class AppError extends Error implements ApiError {
  /** HTTP status code for the error response */
  public readonly statusCode: number;
  
  /** Flag indicating if this is an expected operational error */
  public readonly isOperational: boolean;

  /**
   * Creates a new application error.
   * 
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param isOperational - Whether this is an operational error (default: true)
   */
  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates the main error handling middleware for the Express application.
 * 
 * Handles all uncaught errors, converts them to appropriate HTTP responses,
 * and provides different error details based on environment. In development,
 * includes stack traces for debugging.
 * 
 * Features:
 * - MongoDB error translation to HTTP status codes
 * - Environment-specific error details
 * - Structured error responses with metadata
 * - Stack trace inclusion in development
 * 
 * @param envVars - Environment configuration
 * @returns Express error handling middleware
 */
export function createErrorHandler(envVars: EnvVars) {
  return function errorHandler(
    error: ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    let statusCode = error.statusCode || 500;
    let message = error.message;

    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError' || (error as MongoError).code) {
      const mongoError = error as MongoError;
      
      // Handle duplicate key error (E11000) - Resource Already Exists
      if (mongoError.code === 11000) {
        statusCode = 422; // Unprocessable Entity
        message = 'Resource already exists';
      }
      
      // Handle transaction conflicts and concurrency issues - Resource Conflict
      else if (mongoError.code === 251 || // NoSuchTransaction
               mongoError.code === 112 || // WriteConflict
               mongoError.code === 225) {  // TransactionTooOld
        statusCode = 423; // Locked
        message = 'Resource conflict - please try again';
      }
    }

    const errorDetails = {
      message,
      method: req.method,
      url: req.url,
      statusCode,
      timestamp: new Date().toISOString(),
      stack: envVars.isDevelopment && error.stack ? error.stack.split('\n').map(line => line.trim()).filter(line => line.length > 0) : undefined,
    };

    res.status(statusCode).json(errorDetails);
  };
}

/**
 * Express middleware for handling 404 Not Found errors.
 * 
 * Catches all requests that don't match any defined routes and
 * converts them to structured 404 errors.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.method} ${req.url} not found`, 404));
}

/**
 * Wraps async route handlers to automatically catch and forward errors.
 * 
 * Eliminates the need for try-catch blocks in every async route handler
 * by automatically catching rejected promises and passing them to the
 * error handling middleware.
 * 
 * @param fn - Async route handler function
 * @returns Express middleware that handles async errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Database transaction middleware for handling transactional operations.
 * 
 * Creates a database session, starts a transaction, executes the provided
 * function, and handles commit/rollback automatically. Ensures proper
 * session cleanup regardless of success or failure.
 * 
 * Features:
 * - Automatic transaction lifecycle management
 * - Error handling with automatic rollback
 * - Session cleanup in finally block
 * - Response sent only after successful commit
 * 
 * @param sessionProducer - Database session producer for creating sessions
 * @param fn - Function to execute within the transaction
 * @returns Express middleware that handles database transactions
 */
export function dbTransactionHandler<S>(
  sessionProducer: DatabaseSessionProducer<S>,
  fn: (
    session: DatabaseSession<unknown>, 
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => Promise<{ statusCode?: number; data: unknown }>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let session: DatabaseSession<unknown> | null = null;
    let transactionCommitted = false;
    
    try {
      session = await sessionProducer.createSession();
      await session.startTransaction();
      
      // Execute controller logic but don't send response yet
      const result = await fn(session, req, res, next);
      
      await session.commitTransaction();
      transactionCommitted = true;
      
      // Now send the response AFTER commit
      const statusCode = result.statusCode || 200;
      res.status(statusCode).json(result.data);
      
    } catch (error) {
      if (session && !transactionCommitted) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.error('Error aborting transaction:', abortError);
        }
      }
      // Pass the original error to the error handler
      next(error);
    } finally {
      if (session) {
        try {
          await session.endSession();
        } catch (endError) {
          console.error('Error ending session:', endError);
        }
      }
    }
  };
}
