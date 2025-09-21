import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Type definitions for sanitization
type SanitizableValue = string | number | boolean | null | undefined | SanitizableObject | SanitizableValue[];
interface SanitizableObject {
  [key: string]: SanitizableValue;
}

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const purify = DOMPurify(window as any);

const OBJECT_STRING: string = 'object';

/**
 * Input sanitization middleware for preventing XSS and injection attacks.
 * 
 * Automatically sanitizes all incoming request data (body, query parameters,
 * route parameters) by removing potentially dangerous HTML tags and scripts.
 * Uses DOMPurify for robust XSS prevention while preserving data integrity.
 * 
 * Features:
 * - Deep object and array sanitization
 * - HTML tag stripping with DOMPurify
 * - Preservation of non-string data types
 * - Protection against XSS and HTML injection
 * 
 * Applied globally to all routes for comprehensive input security.
 * 
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next function
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  // Sanitize request body
  if (req.body && typeof req.body === OBJECT_STRING) {
    req.body = sanitizeObject(req.body) as typeof req.body;
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === OBJECT_STRING) {
    req.query = sanitizeObject(req.query) as typeof req.query;
  }

  // Sanitize route parameters
  if (req.params && typeof req.params === OBJECT_STRING) {
    req.params = sanitizeObject(req.params) as typeof req.params;
  }

  next();
}

/**
 * Recursively sanitizes objects, arrays, and strings to prevent XSS attacks.
 * 
 * Traverses nested objects and arrays to sanitize all string values while
 * preserving the structure and non-string data types. Uses DOMPurify to
 * strip HTML tags and potentially dangerous content.
 * 
 * @param obj - Value to sanitize (string, object, array, or primitive)
 * @returns Sanitized value with same structure but cleaned strings
 */
function sanitizeObject(obj: SanitizableValue): SanitizableValue {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Remove HTML tags and potential XSS
    return purify.sanitize(obj, { ALLOWED_TAGS: [] });
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: SanitizableObject = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject((obj as SanitizableObject)[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Creates validation middleware using express-validator chains.
 * 
 * Factory function that creates middleware to run multiple validation
 * chains and return structured error responses if validation fails.
 * Provides consistent error formatting across the application.
 * 
 * Note: This is primarily for express-validator integration. The main
 * validation approach uses class-validator with DTO classes.
 * 
 * @param validations - Array of express-validator validation chains
 * @returns Express middleware function for validation
 */
export function validateRequest(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
        timestamp: new Date().toISOString(),
        path: req.url,
      });
    }

    next();
  };
}
