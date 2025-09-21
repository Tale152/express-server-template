import 'reflect-metadata';
import { EnvVars } from '../src/setup/EnvVars';

// Mock environment variables for testing
export const createMockEnvVars = (): EnvVars => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.PORT = '8080';
  process.env.SERVER_NAME = 'Test Server';
  process.env.CORS_ORIGIN = 'http://localhost:8080';
  process.env.DATABASE_URL = 'mongodb://localhost:27017/test-db';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
  process.env.JWT_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  
  return new EnvVars();
};

// Common test utilities
export const createMockTimestamp = (): number => Date.now();

// Fixed timestamp for consistent testing
export const FIXED_TIMESTAMP = 1642000000000; // 2022-01-12T10:26:40.000Z

// Mock user data for testing
export const mockUser = {
  id: '507f1f77bcf86cd799439011',
  username: 'testuser',
  password: 'hashedpassword'
};

export const mockUserWithoutPassword = {
  id: '507f1f77bcf86cd799439011',
  username: 'testuser'
};

// Global test configuration
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup after all tests
});

// Jest custom matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
});
