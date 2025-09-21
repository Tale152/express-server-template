import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../../utils/JWTService';
import { AppError } from './errorHandler';
import { EnvVars } from '../EnvVars';

/**
 * Interface for authenticated request extensions.
 */
export interface AuthenticatedRequest {
  /** User information extracted from JWT token */
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * Extended Express Request interface with authentication support.
 */
export interface AuthenticatedRequestExtended extends Request, AuthenticatedRequest {}

/**
 * JWT authentication middleware for protected routes.
 * 
 * Verifies the Authorization header Bearer token, extracts user information
 * from the JWT payload, and attaches it to the request object. Protected
 * routes can then access authenticated user data through the request.
 * 
 * Features:
 * - Bearer token extraction from Authorization header
 * - JWT signature and expiration validation
 * - User information injection into request object
 * - Consistent error handling for authentication failures
 * 
 * @param envVars - Environment configuration containing JWT secrets
 * @returns Express middleware function for JWT authentication
 */
export function authMiddleware(envVars: EnvVars) {
  const jwtService = new JWTService(envVars);

  return (req: AuthenticatedRequestExtended, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload: JWTPayload = jwtService.verifyAccessToken(token);
      
      // Add user information to request object
      req.user = {
        userId: payload.userId,
        username: payload.username
      };

      next();
    } catch (error) {
      // JWTService.verifyAccessToken already throws AppError with appropriate message
      next(error);
    }
  };
}

/**
 * Type-safe helper function to extract authenticated user from request.
 * 
 * Provides a safe way to access authenticated user information from
 * request objects in protected route handlers. Throws an error if
 * no user is attached (should not happen if authMiddleware is used).
 * 
 * @param req - Express request object (should be authenticated)
 * @returns User information from the JWT token
 * @throws {AppError} When user is not authenticated (401)
 */
export function getAuthenticatedUser(req: Request): { userId: string; username: string } {
  const authReq = req as AuthenticatedRequestExtended;
  if (!authReq.user) {
    throw new AppError('User not authenticated', 401);
  }
  return authReq.user;
}
