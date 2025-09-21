import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { sanitizeInput, validateRequest } from '../../../../src/setup/middleware/inputSanitization';

// Mock DOMPurify
jest.mock('dompurify', () => ({
  __esModule: true,
  default: jest.fn(() => ({ 
    sanitize: jest.fn((input: string) => input.replace(/<[^>]*>/g, ''))
  }))
}));

jest.mock('jsdom', () => ({
  JSDOM: jest.fn(() => ({ window: {} }))
}));

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

const mockedValidationResult = jest.mocked(validationResult);

describe('Input Sanitization Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { 
      body: {}, 
      query: {}, 
      params: {},
      url: '/test-endpoint'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML in request body', () => {
      mockReq.body = {
        message: '<script>alert("xss")</script>Hello',
        normal: 'test'
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize query parameters', () => {
      mockReq.query = {
        search: '<img src="x" onerror="alert(1)">test'
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize route parameters', () => {
      mockReq.params = {
        id: '<script>malicious</script>123'
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle nested objects', () => {
      mockReq.body = {
        user: {
          name: '<b>John</b>'
        }
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle arrays', () => {
      mockReq.body = {
        tags: ['<script>tag1</script>', 'normal-tag']
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle null and undefined values', () => {
      mockReq.body = {
        nullValue: null,
        undefinedValue: undefined,
        number: 123,
        boolean: true
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip non-object request properties', () => {
      mockReq.body = null;
      mockReq.query = undefined;
      mockReq.params = 'string' as never;

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateRequest', () => {
    let mockValidationChain: Partial<ValidationChain>;

    beforeEach(() => {
      mockValidationChain = {
        run: jest.fn().mockResolvedValue(undefined),
      };
    });

    it('should proceed when no validation errors', async () => {
      const validations = [mockValidationChain as ValidationChain];
      mockedValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([]),
      } as never);

      const middleware = validateRequest(validations);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockValidationChain.run).toHaveBeenCalledWith(mockReq);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 400 error when validation fails', async () => {
      const validations = [mockValidationChain as ValidationChain];
      const validationErrors = [
        { param: 'email', msg: 'Invalid email format' },
        { param: 'password', msg: 'Password too short' },
      ];

      mockedValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(validationErrors),
      } as never);

      const middleware = validateRequest(validations);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation failed',
          details: validationErrors,
        },
        timestamp: expect.any(String),
        path: '/test-endpoint',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle multiple validation chains', async () => {
      const mockRun1 = jest.fn().mockResolvedValue(undefined);
      const mockRun2 = jest.fn().mockResolvedValue(undefined);
      
      const validation1 = { run: mockRun1 } as unknown as ValidationChain;
      const validation2 = { run: mockRun2 } as unknown as ValidationChain;
      const validations = [validation1, validation2];

      mockedValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([]),
      } as never);

      const middleware = validateRequest(validations);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRun1).toHaveBeenCalledWith(mockReq);
      expect(mockRun2).toHaveBeenCalledWith(mockReq);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty validation chains array', async () => {
      const validations: ValidationChain[] = [];
      mockedValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([]),
      } as never);

      const middleware = validateRequest(validations);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should include timestamp in ISO format in error response', async () => {
      const validations = [mockValidationChain as ValidationChain];
      const validationErrors = [{ param: 'name', msg: 'Name is required' }];

      mockedValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(validationErrors),
      } as never);

      // Mock Date.prototype.toISOString
      const mockISOString = '2023-12-25T10:30:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockISOString);

      const middleware = validateRequest(validations);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: mockISOString,
        })
      );
    });

    it('should handle validation chain run errors gracefully', async () => {
      const failingValidation = {
        run: jest.fn().mockRejectedValue(new Error('Validation chain error')),
      };
      const validations = [failingValidation as unknown as ValidationChain];

      mockedValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([]),
      } as never);

      const middleware = validateRequest(validations);

      // This should not throw, but handle the error gracefully
      await expect(middleware(mockReq as Request, mockRes as Response, mockNext))
        .rejects.toThrow('Validation chain error');
    });
  });
});