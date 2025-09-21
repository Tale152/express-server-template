import { createCompressionMiddleware } from '../../../../src/setup/middleware/compression';
import { EnvVars } from '../../../../src/setup/EnvVars';
import { Request, Response, NextFunction } from 'express';

// Mock compression module
jest.mock('compression', () => {
  const mockMiddleware = jest.fn((_req: Request, _res: Response, next: NextFunction) => next());
  const mockFilter = jest.fn((_req: Request, _res: Response) => true);
  
  const mockFn = jest.fn(() => mockMiddleware);
  Object.defineProperty(mockFn, 'filter', {
    value: mockFilter,
    writable: true,
    configurable: true
  });
  
  return mockFn;
});

import compression from 'compression';
const mockCompression = compression as jest.MockedFunction<typeof compression> & {
  filter: jest.MockedFunction<(req: Request, res: Response) => boolean>;
};

describe('compression middleware', () => {
  let mockEnvVars: EnvVars;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      PORT: '3001',
      SERVER_NAME: 'Test Server',
      CORS_ORIGIN: 'http://localhost:3001',
      DATABASE_URL: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
    
    mockEnvVars = new EnvVars();
    
    // Restore original env
    process.env = originalEnv;
  });

  describe('createCompressionMiddleware', () => {
    it('should create compression middleware', () => {
      const middleware = createCompressionMiddleware(mockEnvVars);
      
      expect(mockCompression).toHaveBeenCalledWith(expect.objectContaining({
        level: expect.any(Number),
        threshold: 1024,
        filter: expect.any(Function),
        memLevel: expect.any(Number),
        windowBits: expect.any(Number),
      }));
      
      expect(middleware).toBeDefined();
    });

    it('should use different compression levels for production vs development', () => {
      // Test development environment
      const devEnvVars = { ...mockEnvVars, isProduction: false };
      createCompressionMiddleware(devEnvVars as EnvVars);
      
      expect(mockCompression).toHaveBeenCalledWith(expect.objectContaining({
        level: 4, // Development level
        memLevel: 6,
        windowBits: 13,
      }));
      
      jest.clearAllMocks();
      
      // Test production environment
      const prodEnvVars = { ...mockEnvVars, isProduction: true };
      createCompressionMiddleware(prodEnvVars as EnvVars);
      
      expect(mockCompression).toHaveBeenCalledWith(expect.objectContaining({
        level: 6, // Production level
        memLevel: 8,
        windowBits: 15,
      }));
    });

    it('should configure threshold correctly', () => {
      createCompressionMiddleware(mockEnvVars);
      
      expect(mockCompression).toHaveBeenCalledWith(expect.objectContaining({
        threshold: 1024,
      }));
    });
  });

  describe('compression filter function', () => {
    let filterFunction: (req: Request, res: Response) => boolean;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
      // Create the actual middleware to get the real filter function
      createCompressionMiddleware(mockEnvVars);
      const compressionCall = mockCompression.mock.calls[0];
      if (compressionCall && compressionCall[0] && compressionCall[0].filter) {
        filterFunction = compressionCall[0].filter;
      }
      
      mockReq = {
        headers: {}
      };
      
      mockRes = {
        getHeader: jest.fn()
      };
    });

    it('should return false when client requests no compression', () => {
      if (!filterFunction) return;
      
      mockReq.headers = { 'x-no-compression': 'true' };
      
      const result = filterFunction(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(false);
    });

    it('should return false for event-stream content type', () => {
      if (!filterFunction) return;
      
      (mockRes.getHeader as jest.Mock).mockReturnValue('text/event-stream');
      
      const result = filterFunction(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(false);
    });

    it('should return false when content is already encoded', () => {
      if (!filterFunction) return;
      
      (mockRes.getHeader as jest.Mock)
        .mockReturnValueOnce(undefined) // Content-Type
        .mockReturnValueOnce('gzip'); // Content-Encoding
      
      const result = filterFunction(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(false);
    });

    it('should use default compression filter for normal cases', () => {
      if (!filterFunction) return;
      
      (mockRes.getHeader as jest.Mock).mockReturnValue(undefined);
      mockCompression.filter.mockReturnValue(true);
      
      const result = filterFunction(mockReq as Request, mockRes as Response);
      
      expect(mockCompression.filter).toHaveBeenCalledWith(mockReq, mockRes);
      expect(result).toBe(true);
    });

    it('should handle content-type with event-stream substring', () => {
      if (!filterFunction) return;
      
      (mockRes.getHeader as jest.Mock).mockReturnValue('text/event-stream; charset=utf-8');
      
      const result = filterFunction(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(false);
    });

    it('should handle null content type', () => {
      if (!filterFunction) return;
      
      (mockRes.getHeader as jest.Mock)
        .mockReturnValueOnce(null) // Content-Type is null
        .mockReturnValueOnce(undefined); // Content-Encoding is undefined
      mockCompression.filter.mockReturnValue(true);
      
      const result = filterFunction(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(true);
    });

    it('should handle content type as number', () => {
      if (!filterFunction) return;
      
      (mockRes.getHeader as jest.Mock)
        .mockReturnValueOnce(200) // Content-Type is number
        .mockReturnValueOnce(undefined); // Content-Encoding is undefined
      mockCompression.filter.mockReturnValue(true);
      
      const result = filterFunction(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(true);
    });

    it('should handle falsy content encoding', () => {
      if (!filterFunction) return;
      
      (mockRes.getHeader as jest.Mock)
        .mockReturnValueOnce(undefined) // Content-Type
        .mockReturnValueOnce(''); // Content-Encoding is empty string (falsy)
      mockCompression.filter.mockReturnValue(true);
      
      const result = filterFunction(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(true);
    });
  });
});