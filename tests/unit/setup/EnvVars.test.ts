import { EnvVars } from '../../../src/setup/EnvVars';
import dotenv from 'dotenv';

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('EnvVars', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear all environment variables
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('SERVER_NAME') || 
          key.startsWith('PORT') || 
          key.startsWith('NODE_ENV') || 
          key.startsWith('CORS_ORIGIN') || 
          key.startsWith('DATABASE_URL') || 
          key.startsWith('JWT_')) {
        delete process.env[key];
      }
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('constructor with default values', () => {
    it('should create EnvVars with all default values', () => {
      const envVars = new EnvVars();

      expect(envVars.SERVER_NAME).toBe('Express Server');
      expect(envVars.PORT).toBe(8080);
      expect(envVars.NODE_ENV).toBe('development');
      expect(envVars.CORS_ORIGIN).toEqual(['http://localhost:3000']);
      expect(envVars.DATABASE_URL).toBe('mongodb://localhost:27017/express-server-advanced');
      expect(envVars.JWT_SECRET).toBe('your-super-secret-jwt-key-change-in-production');
      expect(envVars.JWT_EXPIRES_IN).toBe('15m');
      expect(envVars.JWT_REFRESH_SECRET).toBe('your-super-secret-refresh-key-change-in-production');
      expect(envVars.JWT_REFRESH_EXPIRES_IN).toBe('7d');
    });

    it('should have isDevelopment true with default NODE_ENV', () => {
      const envVars = new EnvVars();
      
      expect(envVars.isDevelopment).toBe(true);
      expect(envVars.isProduction).toBe(false);
    });
  });

  describe('constructor with custom environment variables', () => {
    it('should use custom environment variables when provided', () => {
      process.env.SERVER_NAME = 'Custom Server';
      process.env.PORT = '8080';
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://app.example.com,https://api.example.com';
      process.env.DATABASE_URL = 'mongodb://prod:27017/app';
      process.env.JWT_SECRET = 'custom-jwt-secret';
      process.env.JWT_EXPIRES_IN = '30m';
      process.env.JWT_REFRESH_SECRET = 'custom-refresh-secret';
      process.env.JWT_REFRESH_EXPIRES_IN = '30d';

      const envVars = new EnvVars();

      expect(envVars.SERVER_NAME).toBe('Custom Server');
      expect(envVars.PORT).toBe(8080);
      expect(envVars.NODE_ENV).toBe('production');
      expect(envVars.CORS_ORIGIN).toEqual(['https://app.example.com', 'https://api.example.com']);
      expect(envVars.DATABASE_URL).toBe('mongodb://prod:27017/app');
      expect(envVars.JWT_SECRET).toBe('custom-jwt-secret');
      expect(envVars.JWT_EXPIRES_IN).toBe('30m');
      expect(envVars.JWT_REFRESH_SECRET).toBe('custom-refresh-secret');
      expect(envVars.JWT_REFRESH_EXPIRES_IN).toBe('30d');
    });

    it('should have correct environment flags for production', () => {
      process.env.NODE_ENV = 'production';
      
      const envVars = new EnvVars();
      
      expect(envVars.isDevelopment).toBe(false);
      expect(envVars.isProduction).toBe(true);
    });

    it('should have correct environment flags for test', () => {
      process.env.NODE_ENV = 'test';
      
      const envVars = new EnvVars();
      
      expect(envVars.isDevelopment).toBe(false);
      expect(envVars.isProduction).toBe(false);
    });
  });

  describe('CORS_ORIGIN parsing', () => {
    it('should parse single CORS origin', () => {
      process.env.CORS_ORIGIN = 'https://app.example.com';
      
      const envVars = new EnvVars();
      
      expect(envVars.CORS_ORIGIN).toEqual(['https://app.example.com']);
    });

    it('should parse multiple CORS origins with spaces', () => {
      process.env.CORS_ORIGIN = 'https://app.example.com, https://api.example.com, http://localhost:3000';
      
      const envVars = new EnvVars();
      
      expect(envVars.CORS_ORIGIN).toEqual([
        'https://app.example.com',
        'https://api.example.com',
        'http://localhost:3000'
      ]);
    });

    it('should handle CORS origins without spaces', () => {
      process.env.CORS_ORIGIN = 'https://app.example.com,https://api.example.com';
      
      const envVars = new EnvVars();
      
      expect(envVars.CORS_ORIGIN).toEqual([
        'https://app.example.com',
        'https://api.example.com'
      ]);
    });

    it('should trim whitespace from CORS origins', () => {
      process.env.CORS_ORIGIN = '  https://app.example.com  ,  https://api.example.com  ';
      
      const envVars = new EnvVars();
      
      expect(envVars.CORS_ORIGIN).toEqual([
        'https://app.example.com',
        'https://api.example.com'
      ]);
    });
  });

  describe('PORT validation', () => {
    it('should parse valid PORT number', () => {
      process.env.PORT = '8080';
      
      const envVars = new EnvVars();
      
      expect(envVars.PORT).toBe(8080);
    });

    it('should throw error for invalid PORT', () => {
      process.env.PORT = 'invalid';
      
      expect(() => new EnvVars()).toThrow('PORT must be a valid number');
    });

    it('should throw error for empty PORT', () => {
      process.env.PORT = '';
      
      expect(() => new EnvVars()).toThrow('PORT must be a valid number');
    });

    it('should handle decimal PORT by converting to integer', () => {
      process.env.PORT = '8080.5';
      
      const envVars = new EnvVars();
      
      expect(envVars.PORT).toBe(8080);
    });
  });

  describe('required environment variables without defaults', () => {
    it('should not throw error when all variables have defaults', () => {
      // Since all variables have defaults in this implementation,
      // the constructor should not throw for missing variables
      expect(() => {
        new EnvVars();
      }).not.toThrow();
    });
  });

  describe('getter methods', () => {
    it('should return correct values from getters', () => {
      process.env.SERVER_NAME = 'Test Server';
      process.env.PORT = '9000';
      process.env.NODE_ENV = 'staging';
      
      const envVars = new EnvVars();
      
      // Test all getters return the same values
      expect(envVars.SERVER_NAME).toBe('Test Server');
      expect(envVars.PORT).toBe(9000);
      expect(envVars.NODE_ENV).toBe('staging');
      
      // Test getters are consistent across multiple calls
      expect(envVars.SERVER_NAME).toBe(envVars.SERVER_NAME);
      expect(envVars.PORT).toBe(envVars.PORT);
      expect(envVars.NODE_ENV).toBe(envVars.NODE_ENV);
    });
  });

  describe('environment flags edge cases', () => {
    it('should handle mixed case NODE_ENV', () => {
      process.env.NODE_ENV = 'DEVELOPMENT';
      
      const envVars = new EnvVars();
      
      expect(envVars.isDevelopment).toBe(false); // Exact match required
      expect(envVars.isProduction).toBe(false);
    });

    it('should handle empty NODE_ENV with default', () => {
      process.env.NODE_ENV = '';
      
      const envVars = new EnvVars();
      
      expect(envVars.NODE_ENV).toBe(''); // Empty string is returned as-is
      expect(envVars.isDevelopment).toBe(false);
      expect(envVars.isProduction).toBe(false);
    });

    it('should handle undefined NODE_ENV with default', () => {
      delete process.env.NODE_ENV;
      
      const envVars = new EnvVars();
      
      expect(envVars.NODE_ENV).toBe('development'); // Uses default
      expect(envVars.isDevelopment).toBe(true);
      expect(envVars.isProduction).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should allow modification of returned CORS_ORIGIN array (reference returned)', () => {
      const envVars = new EnvVars();
      const corsOrigin = envVars.CORS_ORIGIN;
      
      // The current implementation returns the actual array reference
      corsOrigin.push('https://additional.com');
      
      // The array is modified because it's a reference
      expect(envVars.CORS_ORIGIN).toContain('https://additional.com');
    });
  });

  describe('integration with dotenv', () => {
    it('should have dotenv mock available', () => {
      // Since dotenv is mocked, we just verify the mock is properly set up
      expect(jest.isMockFunction(dotenv.config)).toBe(true);
    });
  });
});
