import { Application } from 'express';
import { initCors } from '../../../src/setup/init_cors';
import { createMockEnvVars } from '../../setup';
import cors from 'cors';
import { AppError } from '../../../src/setup/middleware/errorHandler';

// Mock cors
jest.mock('cors');

describe('CORS initialization', () => {
  let mockApp: jest.Mocked<Application>;
  let mockCors: jest.MockedFunction<typeof cors>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockApp = {
      use: jest.fn()
    } as unknown as jest.Mocked<Application>;
    
    mockCors = cors as jest.MockedFunction<typeof cors>;
    mockCors.mockReturnValue(jest.fn());
  });

  describe('initCors', () => {
    it('should setup CORS with correct options', () => {
      const envVars = createMockEnvVars();
      
      initCors(mockApp, envVars);
      
      expect(mockCors).toHaveBeenCalledWith(
        expect.objectContaining({
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        })
      );
      expect(mockApp.use).toHaveBeenCalled();
    });

    it('should allow requests with no origin', () => {
      const envVars = createMockEnvVars();
      
      initCors(mockApp, envVars);
      
      // Get the CORS options
      const corsOptions = (mockCors as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();
      
      // Test with no origin
      corsOptions.origin(undefined, callback);
      
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should allow all origins in development mode', () => {
      const devEnvVars = createMockEnvVars();
      Object.defineProperty(devEnvVars, 'isDevelopment', { value: true, writable: false });
      
      initCors(mockApp, devEnvVars);
      
      const corsOptions = (mockCors as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();
      
      // Test with any origin in development
      corsOptions.origin('http://localhost:3000', callback);
      
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should check against allowed origins in production mode', () => {
      const prodEnvVars = createMockEnvVars();
      Object.defineProperty(prodEnvVars, 'isDevelopment', { value: false, writable: false });
      Object.defineProperty(prodEnvVars, 'CORS_ORIGIN', { 
        value: ['https://example.com', 'https://app.example.com'], 
        writable: false 
      });
      
      initCors(mockApp, prodEnvVars);
      
      const corsOptions = (mockCors as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();
      
      // Test with allowed origin
      corsOptions.origin('https://example.com', callback);
      expect(callback).toHaveBeenCalledWith(null, true);
      
      // Reset callback
      callback.mockClear();
      
      // Test with disallowed origin
      corsOptions.origin('https://malicious.com', callback);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not allowed by CORS',
          statusCode: 403
        })
      );
    });

    it('should reject unknown origins in production mode', () => {
      const prodEnvVars = createMockEnvVars();
      Object.defineProperty(prodEnvVars, 'isDevelopment', { value: false, writable: false });
      Object.defineProperty(prodEnvVars, 'CORS_ORIGIN', { 
        value: ['https://example.com'], 
        writable: false 
      });
      
      initCors(mockApp, prodEnvVars);
      
      const corsOptions = (mockCors as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();
      
      corsOptions.origin('https://unauthorized.com', callback);
      
      expect(callback).toHaveBeenCalledWith(
        expect.any(AppError)
      );
      
      const errorArg = callback.mock.calls[0][0];
      expect(errorArg.message).toBe('Not allowed by CORS');
      expect(errorArg.statusCode).toBe(403);
    });
  });
});
