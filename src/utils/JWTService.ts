import jwt from 'jsonwebtoken';
import { EnvVars } from '../setup/EnvVars';
import { AppError } from '../setup/middleware/errorHandler';

/**
 * JWT payload interface containing user information.
 * 
 * This interface defines the structure of data contained within JWT tokens
 * for both access and refresh tokens.
 */
export interface JWTPayload {
  /** Unique identifier of the authenticated user */
  userId: string;
  
  /** Username of the authenticated user */
  username: string;
}

/**
 * Interface representing a pair of JWT tokens.
 * 
 * Contains both access and refresh tokens typically generated together
 * during authentication processes.
 */
export interface TokenPair {
  /** JWT access token for API authentication */
  accessToken: string;
  
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string;
}

/**
 * Service class for JWT token operations.
 * 
 * Provides comprehensive JWT functionality including token generation,
 * verification, and decoding. Supports both access and refresh tokens
 * with different secrets and expiration times.
 */
export class JWTService {
  /** Environment variables containing JWT configuration */
  private envVars: EnvVars;

  /**
   * Creates a new JWT service instance.
   * 
   * @param envVars - Environment variables containing JWT secrets and expiration settings
   */
  constructor(envVars: EnvVars) {
    this.envVars = envVars;
  }

  /**
   * Generates a JWT access token.
   * 
   * Creates a signed JWT token with the provided payload, adding entropy
   * to ensure uniqueness even with identical payloads and timestamps.
   * 
   * @param payload - User information to include in the token
   * @returns Signed JWT access token string
   */
  public generateAccessToken(payload: JWTPayload): string {
    // Add entropy to ensure uniqueness even with same payload and timestamp
    const uniquePayload = {
      ...payload,
      nonce: Math.random().toString(36).substring(2, 15)
    };
    
    return jwt.sign(uniquePayload, this.envVars.JWT_SECRET, {
      expiresIn: this.envVars.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Generates a JWT refresh token.
   * 
   * Creates a signed JWT refresh token with the provided payload, using
   * a different secret and longer expiration time than access tokens.
   * 
   * @param payload - User information to include in the token
   * @returns Signed JWT refresh token string
   */
  public generateRefreshToken(payload: JWTPayload): string {
    // Add entropy to ensure uniqueness even with same payload and timestamp
    const uniquePayload = {
      ...payload,
      nonce: Math.random().toString(36).substring(2, 15)
    };
    
    return jwt.sign(uniquePayload, this.envVars.JWT_REFRESH_SECRET, {
      expiresIn: this.envVars.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Generates both access and refresh tokens.
   * 
   * Convenience method that creates both token types with the same payload,
   * ensuring they contain identical user information.
   * 
   * @param payload - User information to include in both tokens
   * @returns Object containing both access and refresh tokens
   */
  public generateTokenPair(payload: JWTPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verifies and decodes a JWT access token.
   * 
   * Validates the token signature and expiration using the access token secret.
   * Returns the decoded payload if valid.
   * 
   * @param token - JWT access token string to verify
   * @returns Decoded JWT payload containing user information
   * @throws {AppError} When token is invalid, expired, or malformed
   */
  public verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.envVars.JWT_SECRET) as JWTPayload;
    } catch (_error) {
      throw new AppError('Invalid or expired access token', 401);
    }
  }

  /**
   * Verifies and decodes a JWT refresh token.
   * 
   * Validates the token signature and expiration using the refresh token secret.
   * Returns the decoded payload if valid.
   * 
   * @param token - JWT refresh token string to verify
   * @returns Decoded JWT payload containing user information
   * @throws {AppError} When token is invalid, expired, or malformed
   */
  public verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.envVars.JWT_REFRESH_SECRET) as JWTPayload;
    } catch (_error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Decodes a JWT token without verification.
   * 
   * Extracts the payload from a JWT token without validating the signature
   * or expiration. Useful for debugging or extracting information from
   * potentially invalid tokens.
   * 
   * @param token - JWT token string to decode
   * @returns Decoded JWT payload or null if token is malformed
   */
  public decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (_error) {
      return null;
    }
  }
}
