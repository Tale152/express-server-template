import mongoose from 'mongoose';
import { AppError } from '../../../../../src/setup/middleware/errorHandler';
import {
  isMongoDBDuplicateKeyError,
  extractUserIdString,
  validateMongoObjectId,
  validateMongoObjectIds,
} from '../../../../../src/domain/mongodb/utils/MongoDBErrorUtils';

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

const mockedMongoose = jest.mocked(mongoose);

describe('MongoDBErrorUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isMongoDBDuplicateKeyError', () => {
    it('should return true for MongoDB duplicate key error', () => {
      // Create a proper Error object with code property
      const error = new Error('E11000 duplicate key error') as Error & { code: number; keyPattern?: Record<string, number> };
      error.code = 11000;
      error.keyPattern = { username: 1 };

      const result = isMongoDBDuplicateKeyError(error);

      expect(result).toBe(true);
    });

    it('should return false for non-Error objects', () => {
      const error = 'string error';

      const result = isMongoDBDuplicateKeyError(error);

      expect(result).toBe(false);
    });

    it('should return false for Error without code property', () => {
      const error = new Error('Regular error');

      const result = isMongoDBDuplicateKeyError(error);

      expect(result).toBe(false);
    });

    it('should return false for Error with different code', () => {
      const error = Object.assign(new Error('Different error'), { code: 11001 });

      const result = isMongoDBDuplicateKeyError(error);

      expect(result).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isMongoDBDuplicateKeyError(null)).toBe(false);
      expect(isMongoDBDuplicateKeyError(undefined)).toBe(false);
    });

    it('should return false for object without Error prototype', () => {
      const error = { code: 11000 };

      const result = isMongoDBDuplicateKeyError(error);

      expect(result).toBe(false);
    });
  });

  describe('extractUserIdString', () => {
    it('should return string userId as is', () => {
      const userId = '507f1f77bcf86cd799439011';

      const result = extractUserIdString(userId);

      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should extract _id from populated User object', () => {
      const userObject = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
      };

      const result = extractUserIdString(userObject);

      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should convert ObjectId to string', () => {
      const objectId = {
        toString: () => '507f1f77bcf86cd799439011',
      };

      const result = extractUserIdString(objectId);

      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    it('should convert number to string', () => {
      const userId = 123456;

      const result = extractUserIdString(userId);

      expect(result).toBe('123456');
    });

    it('should convert boolean to string', () => {
      const userId = true;

      const result = extractUserIdString(userId);

      expect(result).toBe('true');
    });

    it('should convert null to string', () => {
      const userId = null;

      const result = extractUserIdString(userId);

      expect(result).toBe('null');
    });

    it('should convert undefined to string', () => {
      const userId = undefined;

      const result = extractUserIdString(userId);

      expect(result).toBe('undefined');
    });

    it('should handle nested ObjectId in object', () => {
      const userObject = {
        _id: {
          toString: () => '507f1f77bcf86cd799439011',
        },
        username: 'testuser',
      };

      const result = extractUserIdString(userObject);

      expect(result).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('validateMongoObjectId', () => {
    it('should not throw for valid ObjectId', () => {
      mockedMongoose.Types.ObjectId.isValid.mockReturnValue(true);

      expect(() => {
        validateMongoObjectId('507f1f77bcf86cd799439011', 'user');
      }).not.toThrow();

      expect(mockedMongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw AppError for invalid ObjectId', () => {
      mockedMongoose.Types.ObjectId.isValid.mockReturnValue(false);

      expect(() => {
        validateMongoObjectId('invalid-id', 'user');
      }).toThrow(AppError);

      expect(() => {
        validateMongoObjectId('invalid-id', 'user');
      }).toThrow('Invalid user ID format');
    });

    it('should throw AppError with correct status code', () => {
      mockedMongoose.Types.ObjectId.isValid.mockReturnValue(false);

      try {
        validateMongoObjectId('invalid-id', 'project');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toBe('Invalid project ID format');
      }
    });

    it('should validate different entity names', () => {
      mockedMongoose.Types.ObjectId.isValid.mockReturnValue(false);

      expect(() => {
        validateMongoObjectId('invalid-id', 'token');
      }).toThrow('Invalid token ID format');
    });
  });

  describe('validateMongoObjectIds', () => {
    it('should validate all IDs successfully', () => {
      mockedMongoose.Types.ObjectId.isValid.mockReturnValue(true);

      const validations = [
        { id: '507f1f77bcf86cd799439011', entityName: 'user' },
        { id: '507f1f77bcf86cd799439012', entityName: 'project' },
        { id: '507f1f77bcf86cd799439013', entityName: 'token' },
      ];

      expect(() => {
        validateMongoObjectIds(validations);
      }).not.toThrow();

      expect(mockedMongoose.Types.ObjectId.isValid).toHaveBeenCalledTimes(3);
    });

    it('should throw AppError for first invalid ID', () => {
      mockedMongoose.Types.ObjectId.isValid
        .mockReturnValueOnce(true)   // First ID valid
        .mockReturnValueOnce(false)  // Second ID invalid
        .mockReturnValueOnce(true);  // Third ID valid (not reached)

      const validations = [
        { id: '507f1f77bcf86cd799439011', entityName: 'user' },
        { id: 'invalid-id', entityName: 'project' },
        { id: '507f1f77bcf86cd799439013', entityName: 'token' },
      ];

      expect(() => {
        validateMongoObjectIds(validations);
      }).toThrow('Invalid project ID format');

      expect(mockedMongoose.Types.ObjectId.isValid).toHaveBeenCalledTimes(2);
    });

    it('should handle empty validation array', () => {
      expect(() => {
        validateMongoObjectIds([]);
      }).not.toThrow();

      expect(mockedMongoose.Types.ObjectId.isValid).not.toHaveBeenCalled();
    });

    it('should validate single ID', () => {
      mockedMongoose.Types.ObjectId.isValid.mockReturnValue(true);

      const validations = [
        { id: '507f1f77bcf86cd799439011', entityName: 'user' },
      ];

      expect(() => {
        validateMongoObjectIds(validations);
      }).not.toThrow();

      expect(mockedMongoose.Types.ObjectId.isValid).toHaveBeenCalledTimes(1);
    });
  });
});