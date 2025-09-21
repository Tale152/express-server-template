import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppError } from './errorHandler';

/**
 * Creates middleware for validating request body against a DTO class.
 * 
 * Uses class-validator and class-transformer to validate incoming request
 * bodies against defined DTO classes with validation decorators. Transforms
 * plain objects to class instances and validates them according to the
 * decorators defined in the DTO class.
 * 
 * Features:
 * - Automatic DTO instantiation and validation
 * - Detailed error messages from validation decorators
 * - Request body replacement with validated instance
 * - Type-safe validation with TypeScript classes
 * 
 * @param classType - DTO class constructor for validation
 * @returns Express middleware function for request body validation
 */
export function validateRequestBody<T extends object>(classType: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Transform plain object to class instance with options to handle undefined/null properly
      const dto = plainToClass(classType, req.body, { 
        enableImplicitConversion: false,
        excludeExtraneousValues: false 
      });
      
      // Validate the instance
      const errors = await validate(dto, { 
        skipMissingProperties: false,
        whitelist: false,
        forbidNonWhitelisted: false
      });
      
      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints).join(', ') : 'Validation error';
        });
        
        throw new AppError(`Validation failed: ${errorMessages.join('; ')}`, 400);
      }
      
      // Replace req.body with validated and transformed object
      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Creates middleware for validating request parameters against a DTO class.
 * 
 * Similar to validateRequestBody but specifically for URL parameters.
 * Validates path parameters (like :id, :userId) against a DTO class
 * with appropriate validation decorators.
 * 
 * Features:
 * - Path parameter validation with DTO classes
 * - Type transformation for numeric/boolean parameters
 * - Detailed validation error messages
 * - Request params replacement with validated instance
 * 
 * @param classType - DTO class constructor for parameter validation
 * @returns Express middleware function for request parameter validation
 */
export function validateRequestParams<T extends object>(classType: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Transform plain object to class instance
      const dto = plainToClass(classType, req.params);
      
      // Validate the instance
      const errors = await validate(dto);
      
      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints).join(', ') : 'Validation error';
        });
        
        throw new AppError(`Parameter validation failed: ${errorMessages.join('; ')}`, 400);
      }
      
      // Replace req.params with validated and transformed object
      req.params = dto as Record<string, string>;
      next();
    } catch (error) {
      next(error);
    }
  };
}
