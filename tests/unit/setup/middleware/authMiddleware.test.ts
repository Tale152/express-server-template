import { Request, Response, NextFunction } from 'express';
import { authMiddleware, getAuthenticatedUser, AuthenticatedRequestExtended } from '../../../../src/setup/middleware/authMiddleware';
import { AppError } from '../../../../src/setup/middleware/errorHandler';
import { createMockEnvVars } from '../../../setup';

describe('authMiddleware', () => {
  let mockRequest: Partial<AuthenticatedRequestExtended>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  const envVars = createMockEnvVars();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {}
    };
    
    mockResponse = {};
    
    mockNext = jest.fn();
  });

  describe('authMiddleware function', () => {
    const middleware = authMiddleware(envVars);

    it('should throw AppError when no authorization header is provided', () => {
      // No authorization header
      expect(() => {
        middleware(mockRequest as AuthenticatedRequestExtended, mockResponse as Response, mockNext);
      }).toThrow(new AppError('Access token required', 401));
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw AppError when authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic sometoken'
      };

      expect(() => {
        middleware(mockRequest as AuthenticatedRequestExtended, mockResponse as Response, mockNext);
      }).toThrow(new AppError('Access token required', 401));
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should attempt to verify token when Bearer header is provided', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalidtoken'
      };

      // This will throw an error from JWTService since the token is invalid
      // but it proves the middleware is attempting to verify the token
      middleware(mockRequest as AuthenticatedRequestExtended, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const callArgs = (mockNext as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(Error);
    });

    it('should extract token correctly from Bearer header', () => {
      mockRequest.headers = {
        authorization: 'Bearer   invalidtoken   '  // Test with extra spaces
      };

      middleware(mockRequest as AuthenticatedRequestExtended, mockResponse as Response, mockNext);

      // Should call next with an error since the token is invalid
      expect(mockNext).toHaveBeenCalled();
      const callArgs = (mockNext as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(Error);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return user when authenticated', () => {
      const mockUser = {
        userId: 'user123',
        username: 'testuser'
      };

      const authenticatedRequest = {
        user: mockUser
      } as AuthenticatedRequestExtended;

      const result = getAuthenticatedUser(authenticatedRequest);

      expect(result).toEqual(mockUser);
    });

    it('should throw AppError when user is not authenticated', () => {
      const unauthenticatedRequest = {} as Request;

      expect(() => {
        getAuthenticatedUser(unauthenticatedRequest);
      }).toThrow(new AppError('User not authenticated', 401));
    });

    it('should throw AppError when user is undefined', () => {
      const requestWithUndefinedUser = {
        user: undefined
      } as AuthenticatedRequestExtended;

      expect(() => {
        getAuthenticatedUser(requestWithUndefinedUser);
      }).toThrow(new AppError('User not authenticated', 401));
    });
  });
});
