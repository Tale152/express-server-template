import { Request, Response, NextFunction } from 'express';
import { 
  AppError, 
  createErrorHandler, 
  notFoundHandler, 
  asyncHandler,
  dbTransactionHandler,
  ApiError 
} from '../../../../src/setup/middleware/errorHandler';
import { createMockEnvVars } from '../../../setup';
import { DatabaseSessionProducer } from '../../../../src/domain/interfaces/DatabaseSessionProducer';
import { DatabaseSession } from '../../../../src/domain/interfaces/DatabaseSession';

// Mock console methods
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('errorHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
    
    mockRequest = {
      method: 'GET',
      url: '/api/test'
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();
  });

  describe('AppError class', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('Error');
    });

    it('should create AppError with custom values', () => {
      const error = new AppError('Custom error', 404, false);
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(false);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Stack test');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack test');
    });
  });

  describe('createErrorHandler', () => {
    it('should handle error with status code in development mode', () => {
      const devEnvVars = createMockEnvVars();
      Object.defineProperty(devEnvVars, 'isDevelopment', { value: true, writable: false });
      const errorHandler = createErrorHandler(devEnvVars);
      
      const error = new AppError('Test error', 400);
      error.stack = 'Error: Test error\n    at test (file.js:1:1)\n    at another (file.js:2:2)';
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Test error',
        method: 'GET',
        url: '/api/test',
        statusCode: 400,
        timestamp: expect.any(String),
        stack: ['Error: Test error', 'at test (file.js:1:1)', 'at another (file.js:2:2)']
      });
    });

    it('should handle error without stack trace in production mode', () => {
      const prodEnvVars = createMockEnvVars();
      Object.defineProperty(prodEnvVars, 'isDevelopment', { value: false, writable: false });
      const errorHandler = createErrorHandler(prodEnvVars);
      
      const error = new AppError('Production error', 401);
      error.stack = 'Some stack trace';
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Production error',
        method: 'GET',
        url: '/api/test',
        statusCode: 401,
        timestamp: expect.any(String),
        stack: undefined
      });
    });

    it('should use default status code 500 when not provided', () => {
      const errorHandler = createErrorHandler(createMockEnvVars());
      
      const error: ApiError = new Error('Generic error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Generic error',
        method: 'GET',
        url: '/api/test',
        statusCode: 500,
        timestamp: expect.any(String),
        stack: undefined
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should call next with 404 AppError', () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/nonexistent';
      
      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route POST /api/nonexistent not found',
          statusCode: 404
        })
      );
    });
  });

  describe('asyncHandler', () => {
    it('should call the wrapped function and pass through result', async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(mockAsyncFn);
      
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockAsyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch errors and pass to next', async () => {
      const testError = new Error('Async error');
      const mockAsyncFn = jest.fn().mockRejectedValue(testError);
      const wrappedFn = asyncHandler(mockAsyncFn);
      
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });

  describe('dbTransactionHandler', () => {
    let mockSession: jest.Mocked<DatabaseSession<unknown>>;
    let mockSessionProducer: jest.Mocked<DatabaseSessionProducer<unknown>>;
    let mockAsyncFn: jest.Mock;

    beforeEach(() => {
      mockSession = {
        session: {},
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn()
      } as unknown as jest.Mocked<DatabaseSession<unknown>>;

      mockSessionProducer = {
        createSession: jest.fn().mockResolvedValue(mockSession)
      } as jest.Mocked<DatabaseSessionProducer<unknown>>;

      mockAsyncFn = jest.fn();
    });

    it('should successfully complete transaction', async () => {
      mockAsyncFn.mockResolvedValue('success');
      const wrappedFn = dbTransactionHandler(mockSessionProducer, mockAsyncFn);
      
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockSessionProducer.createSession).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });
  });
});
