/**
 * MongoDB Error Utilities
 * 
 * Shared utilities for handling MongoDB-specific errors and operations
 * across different DAO implementations.
 */

import mongoose from 'mongoose';
import { AppError } from '../../../setup/middleware/errorHandler';

/**
 * Interface for MongoDB duplicate key errors
 * Represents the structure of MongoDB 11000 error code (duplicate key violation)
 */
export interface MongoDBDuplicateKeyError extends Error {
  code: number;
  keyPattern?: Record<string, number>;
}

/**
 * Type guard to check if an error is a MongoDB duplicate key error
 * 
 * MongoDB throws errors with code 11000 when attempting to insert/update
 * documents that would violate unique index constraints.
 * 
 * @param {unknown} error - The error to check
 * @returns {boolean} True if error is a MongoDB duplicate key error (code 11000)
 */
export function isMongoDBDuplicateKeyError(error: unknown): error is MongoDBDuplicateKeyError {
  return error instanceof Error && 
         'code' in error && 
         (error as MongoDBDuplicateKeyError).code === 11000;
}

/**
 * Extracts a clean userId string from MongoDB document userId field
 * 
 * Handles multiple cases:
 * - String userId (already converted)
 * - ObjectId userId (needs toString())
 * - Populated User object (extract _id field)
 * 
 * @param {unknown} userIdRaw - Raw userId value from MongoDB document
 * @returns {string} Clean userId string
 */
export function extractUserIdString(userIdRaw: unknown): string {
  if (typeof userIdRaw === 'string') {
    return userIdRaw;
  } else if (userIdRaw && typeof userIdRaw === 'object') {
    // If populated User object, use _id; if ObjectId, use toString()
    if ('_id' in userIdRaw) {
      return String((userIdRaw as { _id: unknown })._id);
    } else {
      return String(userIdRaw);
    }
  } else {
    return String(userIdRaw);
  }
}

/**
 * Validates MongoDB ObjectId format and throws AppError if invalid
 * 
 * Common validation used across all MongoDB DAOs to ensure ObjectId format
 * is valid before performing database operations. Provides consistent error
 * handling and prevents invalid query attempts.
 * 
 * @param {string} id - The ID string to validate
 * @param {string} entityName - Name of the entity for error message (e.g., 'user', 'project')
 * @throws {AppError} If ID format is invalid (400 status)
 */
export function validateMongoObjectId(id: string, entityName: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${entityName} ID format`, 400);
  }
}

/**
 * Validates multiple MongoDB ObjectId formats and throws AppError if any is invalid
 * 
 * Convenient utility for operations that require multiple ID validations,
 * such as ownership checks or relationship operations.
 * 
 * @param {Array<{id: string, entityName: string}>} validations - Array of ID/entity pairs to validate
 * @throws {AppError} If any ID format is invalid (400 status)
 */
export function validateMongoObjectIds(validations: Array<{id: string, entityName: string}>): void {
  for (const { id, entityName } of validations) {
    validateMongoObjectId(id, entityName);
  }
}