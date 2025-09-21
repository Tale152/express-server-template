import { User } from '../../src/domain/interfaces/entities/User';

/**
 * Mock user data for testing
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '507f1f77bcf86cd799439011',
  username: 'testuser',
  password: 'hashedpassword123',
  createdAt: new Date('2022-01-12T10:26:40.000Z'),
  updatedAt: new Date('2022-01-12T10:26:40.000Z'),
  ...overrides,
});

/**
 * Mock user data without password for responses
 */
export const createMockUserWithoutPassword = (overrides: Partial<Omit<User, 'password'>> = {}) => ({
  id: '507f1f77bcf86cd799439011',
  username: 'testuser',
  createdAt: new Date('2022-01-12T10:26:40.000Z'),
  updatedAt: new Date('2022-01-12T10:26:40.000Z'),
  ...overrides,
});

// Counter to ensure absolute uniqueness across all test calls
let testCounter = 0;

/**
 * Create test credentials with unique username
 */
export const createTestCredentials = () => {
  testCounter++;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 8);
  const processId = process.pid.toString(36);
  const uniqueSuffix = `${timestamp}_${random}_${processId}_${testCounter}`;
  
  return {
    username: `testuser_${uniqueSuffix}`,
    password: 'TestPassword123!',
  };
};

/**
 * Fixed timestamp for consistent testing
 */
export const FIXED_TIMESTAMP = 1642000000000; // 2022-01-12T10:26:40.000Z

/**
 * Create test JWT token payload
 */
export const createTestTokenPayload = (userId?: string) => ({
  userId: userId || '507f1f77bcf86cd799439011',
  username: 'testuser',
  iat: Math.floor(FIXED_TIMESTAMP / 1000),
  exp: Math.floor(FIXED_TIMESTAMP / 1000) + 15 * 60, // 15 minutes
});

/**
 * Create test refresh token payload
 */
export const createTestRefreshTokenPayload = (userId?: string) => ({
  userId: userId || '507f1f77bcf86cd799439011',
  username: 'testuser',
  iat: Math.floor(FIXED_TIMESTAMP / 1000),
  exp: Math.floor(FIXED_TIMESTAMP / 1000) + 7 * 24 * 60 * 60, // 7 days
});

/**
 * Helper to extract token from response
 */
export const extractTokenFromResponse = (response: { body?: { accessToken?: string; token?: string } }): string => {
  return response.body?.accessToken || response.body?.token || '';
};

/**
 * Helper to extract refresh token from response
 */
export const extractRefreshTokenFromResponse = (response: { body?: { refreshToken?: string } }): string => {
  return response.body?.refreshToken || '';
};

/**
 * Sleep utility for tests
 */
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Response type for auth endpoints
 */
type AuthResponse = {
  body: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
    };
  };
};

/**
 * Response type for error endpoints
 */
type ErrorResponse = {
  status: number;
  body: {
    error?: string;
    message?: string;
  };
};

/**
 * Validate response structure for auth endpoints
 */
export const validateAuthResponse = (response: AuthResponse) => {
  expect(response.body).toHaveProperty('accessToken');
  expect(response.body).toHaveProperty('refreshToken');
  expect(response.body).toHaveProperty('user');
  expect(response.body.user).toHaveProperty('id');
  expect(response.body.user).toHaveProperty('username');
  expect(typeof response.body.accessToken).toBe('string');
  expect(typeof response.body.refreshToken).toBe('string');
  expect(typeof response.body.user.id).toBe('string');
  expect(typeof response.body.user.username).toBe('string');
};

/**
 * Validate error response structure
 */
export const validateErrorResponse = (
  response: ErrorResponse, 
  expectedStatus: number, 
  expectedMessage?: string
) => {
  expect(response.status).toBe(expectedStatus);
  
  // Check for either 'error' or 'message' property
  const errorMessage = response.body.error || response.body.message;
  expect(errorMessage).toBeDefined();
  
  if (expectedMessage) {
    expect(errorMessage).toContain(expectedMessage);
  }
};
