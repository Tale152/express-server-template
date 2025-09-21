import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { EnvVars } from '../EnvVars';

/**
 * Creates rate limiting middleware for different types of endpoints.
 * 
 * Provides multiple rate limiting strategies to protect the API from abuse:
 * - General limiter for standard API endpoints
 * - Strict limiter for sensitive operations (auth, user management)
 * - Speed limiter for progressive request slowing
 * 
 * Features environment-specific limits (more generous in development)
 * and includes proper HTTP headers for client rate limit awareness.
 * 
 * @param envVars - Environment configuration for rate limit adjustment
 * @returns Object containing different rate limiting middleware functions
 */
export function createRateLimiters(envVars: EnvVars) {
  // General API rate limiter
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: envVars.isDevelopment ? 1000 : 100, // More generous in development
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict rate limiter for sensitive endpoints
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: envVars.isDevelopment ? 100 : 5, // Very strict
    message: {
      error: 'Too many requests to this endpoint, please try again later.',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Speed limiter to slow down requests progressively
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: envVars.isDevelopment ? 100 : 20, // Allow 20 requests per 15 minutes at full speed
    delayMs: () => 500, // Slow down subsequent requests by 500ms per request
    maxDelayMs: 10000, // Maximum delay of 10 seconds
  });

  return {
    generalLimiter,
    strictLimiter,
    speedLimiter,
  };
}
