import { createRateLimiters } from '../../../../src/setup/middleware/rateLimiters';
import { EnvVars } from '../../../../src/setup/EnvVars';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// Mock express-rate-limit and express-slow-down
jest.mock('express-rate-limit');
jest.mock('express-slow-down');

describe('rateLimiters', () => {
  let mockRateLimit: jest.MockedFunction<typeof rateLimit>;
  let mockSlowDown: jest.MockedFunction<typeof slowDown>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;
    mockSlowDown = slowDown as jest.MockedFunction<typeof slowDown>;
    
    // Mock return values
    mockRateLimit.mockReturnValue(jest.fn() as unknown as ReturnType<typeof rateLimit>);
    mockSlowDown.mockReturnValue(jest.fn() as unknown as ReturnType<typeof slowDown>);
  });

  describe('createRateLimiters', () => {
    it('should create all three limiters', () => {
      const mockEnvVars = { isDevelopment: false } as EnvVars;
      const limiters = createRateLimiters(mockEnvVars);

      expect(limiters).toHaveProperty('generalLimiter');
      expect(limiters).toHaveProperty('strictLimiter');
      expect(limiters).toHaveProperty('speedLimiter');
      expect(mockRateLimit).toHaveBeenCalledTimes(2);
      expect(mockSlowDown).toHaveBeenCalledTimes(1);
    });

    it('should configure general limiter with production settings', () => {
      const mockEnvVars = { isDevelopment: false } as EnvVars;
      createRateLimiters(mockEnvVars);

      expect(mockRateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes',
          },
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    });

    it('should configure general limiter with development settings', () => {
      const mockEnvVars = { isDevelopment: true } as EnvVars;
      createRateLimiters(mockEnvVars);

      expect(mockRateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          max: 1000,
          message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes',
          },
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    });

    it('should configure strict limiter with production settings', () => {
      const mockEnvVars = { isDevelopment: false } as EnvVars;
      createRateLimiters(mockEnvVars);

      expect(mockRateLimit).toHaveBeenNthCalledWith(2, 
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          max: 5,
          message: {
            error: 'Too many requests to this endpoint, please try again later.',
            retryAfter: '15 minutes',
          },
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    });

    it('should configure strict limiter with development settings', () => {
      const mockEnvVars = { isDevelopment: true } as EnvVars;
      createRateLimiters(mockEnvVars);

      expect(mockRateLimit).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message: {
            error: 'Too many requests to this endpoint, please try again later.',
            retryAfter: '15 minutes',
          },
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    });

    it('should configure speed limiter with production settings', () => {
      const mockEnvVars = { isDevelopment: false } as EnvVars;
      createRateLimiters(mockEnvVars);

      expect(mockSlowDown).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          delayAfter: 20,
          delayMs: expect.any(Function),
          maxDelayMs: 10000,
        })
      );
    });

    it('should configure speed limiter with development settings', () => {
      const mockEnvVars = { isDevelopment: true } as EnvVars;
      createRateLimiters(mockEnvVars);

      expect(mockSlowDown).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          delayAfter: 100,
          delayMs: expect.any(Function),
          maxDelayMs: 10000,
        })
      );
    });
  });

  describe('delayMs function', () => {
    it('should return 500ms delay consistently', () => {
      const mockEnvVars = { isDevelopment: false } as EnvVars;
      createRateLimiters(mockEnvVars);

      const speedLimiterCall = mockSlowDown.mock.calls[0];
      const config = speedLimiterCall?.[0];
      const delayMsFunction = config?.delayMs as () => number;

      expect(delayMsFunction).toBeDefined();
      expect(delayMsFunction()).toBe(500);
      expect(delayMsFunction()).toBe(500);
    });
  });

  describe('configuration validation', () => {
    it('should use 15 minutes window for all limiters', () => {
      const mockEnvVars = { isDevelopment: false } as EnvVars;
      createRateLimiters(mockEnvVars);

      const expectedWindowMs = 15 * 60 * 1000;

      // Check general limiter
      expect(mockRateLimit.mock.calls[0]?.[0]?.windowMs).toBe(expectedWindowMs);
      // Check strict limiter
      expect(mockRateLimit.mock.calls[1]?.[0]?.windowMs).toBe(expectedWindowMs);
      // Check speed limiter
      expect(mockSlowDown.mock.calls[0]?.[0]?.windowMs).toBe(expectedWindowMs);
    });

    it('should use correct header configuration', () => {
      const mockEnvVars = { isDevelopment: false } as EnvVars;
      createRateLimiters(mockEnvVars);

      // Both rate limiters should have same header config
      const generalConfig = mockRateLimit.mock.calls[0]?.[0];
      const strictConfig = mockRateLimit.mock.calls[1]?.[0];

      expect(generalConfig?.standardHeaders).toBe(true);
      expect(generalConfig?.legacyHeaders).toBe(false);
      expect(strictConfig?.standardHeaders).toBe(true);
      expect(strictConfig?.legacyHeaders).toBe(false);
    });

    it('should have correct error messages', () => {
      const mockEnvVars = { isDevelopment: false } as EnvVars;
      createRateLimiters(mockEnvVars);

      const generalMessage = mockRateLimit.mock.calls[0]?.[0]?.message;
      const strictMessage = mockRateLimit.mock.calls[1]?.[0]?.message;

      expect(generalMessage).toEqual({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes',
      });

      expect(strictMessage).toEqual({
        error: 'Too many requests to this endpoint, please try again later.',
        retryAfter: '15 minutes',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined isDevelopment as production', () => {
      const mockEnvVars = {} as EnvVars;
      
      expect(() => createRateLimiters(mockEnvVars)).not.toThrow();
      
      // Should default to production settings when isDevelopment is falsy
      expect(mockRateLimit.mock.calls[0]?.[0]?.max).toBe(100);
      expect(mockRateLimit.mock.calls[1]?.[0]?.max).toBe(5);
      expect(mockSlowDown.mock.calls[0]?.[0]?.delayAfter).toBe(20);
    });
  });

  describe('return structure', () => {
    it('should return object with all three limiters', () => {
      const generalMock = jest.fn();
      const strictMock = jest.fn();
      const speedMock = jest.fn();

      mockRateLimit
        .mockReturnValueOnce(generalMock as unknown as ReturnType<typeof rateLimit>)
        .mockReturnValueOnce(strictMock as unknown as ReturnType<typeof rateLimit>);
      mockSlowDown.mockReturnValue(speedMock as unknown as ReturnType<typeof slowDown>);

      const mockEnvVars = { isDevelopment: false } as EnvVars;
      const result = createRateLimiters(mockEnvVars);

      expect(result).toEqual({
        generalLimiter: generalMock,
        strictLimiter: strictMock,
        speedLimiter: speedMock,
      });
    });
  });
});
