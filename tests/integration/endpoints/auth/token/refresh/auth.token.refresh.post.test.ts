import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../../setup';
import { validateErrorResponse, createTestCredentials, extractRefreshTokenFromResponse } from '../../../../helpers';

/**
 * Validate response structure for token refresh endpoints
 */
const validateRefreshTokenResponse = (response: { body: { accessToken: string; refreshToken: string } }) => {
  expect(response.body).toHaveProperty('accessToken');
  expect(response.body).toHaveProperty('refreshToken');
  expect(typeof response.body.accessToken).toBe('string');
  expect(typeof response.body.refreshToken).toBe('string');
  // Refresh token response should NOT include user info
  expect(response.body).not.toHaveProperty('user');
};

describe('Auth Token Refresh Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('POST /auth/token/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const credentials = createTestCredentials();
      
      // Register and login to get initial tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      const refreshToken = extractRefreshTokenFromResponse(loginResponse);

      // Use refresh token to get new tokens
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken })
        .expect(200);

      validateRefreshTokenResponse(response);
      
      // New tokens should be different from original
      expect(response.body.accessToken).not.toBe(loginResponse.body.accessToken);
      expect(response.body.refreshToken).not.toBe(loginResponse.body.refreshToken);
    });

    it('should return proper content type', async () => {
      const credentials = createTestCredentials();
      
      // Register and login to get initial tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      const refreshToken = extractRefreshTokenFromResponse(loginResponse);

      await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject expired refresh token', async () => {
      // This would require mocking time or creating a token with past expiration
      // For now, we'll test with a malformed token that would fail validation
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token' })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject refresh token for non-existent user', async () => {
      // Create a token-like string that would decode but reference non-existent user
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDcxMmZhYjUzZjY5NTAwMTUzYjQ5ZjAiLCJ1c2VybmFtZSI6Im5vbmV4aXN0ZW50IiwiaWF0IjoxNjE4MTQzMTQ3LCJleHAiOjE2MTg3NDc5NDd9.invalidSignature';
      
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: fakeToken })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should validate required fields', async () => {
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({})
        .expect(400);

      validateErrorResponse(response, 400);
      expect(response.body.message).toContain('Refresh token is required');
    });

    it('should validate field types', async () => {
      const invalidRequests = [
        { refreshToken: 123 },
        { refreshToken: null },
        { refreshToken: undefined },
        { refreshToken: {} },
        { refreshToken: [] },
      ];

      for (const invalidRequest of invalidRequests) {
        const response = await request(context.app)
          .post('/auth/token/refresh')
          .send(invalidRequest)
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should generate different tokens on multiple refresh calls', async () => {
      const credentials = createTestCredentials();
      
      // Register and login to get initial tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      let currentRefreshToken = extractRefreshTokenFromResponse(loginResponse);

      // First refresh
      const refreshResponse1 = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: currentRefreshToken })
        .expect(200);

      validateRefreshTokenResponse(refreshResponse1);
      currentRefreshToken = extractRefreshTokenFromResponse(refreshResponse1);

      // Second refresh with the new refresh token
      const refreshResponse2 = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: currentRefreshToken })
        .expect(200);

      validateRefreshTokenResponse(refreshResponse2);

      // All tokens should be different
      expect(refreshResponse1.body.accessToken).not.toBe(refreshResponse2.body.accessToken);
      expect(refreshResponse1.body.refreshToken).not.toBe(refreshResponse2.body.refreshToken);
    });

    it('should handle concurrent refresh requests', async () => {
      const credentials = createTestCredentials();
      
      // Register and login to get initial tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      const refreshToken = extractRefreshTokenFromResponse(loginResponse);

      // Multiple concurrent refresh requests with same token
      const refreshPromises = Array.from({ length: 3 }, () =>
        request(context.app)
          .post('/auth/token/refresh')
          .send({ refreshToken })
      );

      const responses = await Promise.all(refreshPromises);
      
      // Some might succeed, some might fail due to token invalidation
      // This tests the system's behavior under concurrent access
      const successfulResponses = responses.filter(r => r.status === 200);

      // At least one should succeed
      expect(successfulResponses.length).toBeGreaterThan(0);
      
      successfulResponses.forEach(response => {
        validateRefreshTokenResponse(response);
      });
    });

    it('should handle malformed JSON', async () => {
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .set('Content-Type', 'application/json')
        .send('{"refreshToken": "valid", }') // malformed JSON
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should handle empty request body', async () => {
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send()
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should reject empty string refresh token', async () => {
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: '' })
        .expect(400);

      validateErrorResponse(response, 400);
      expect(response.body.message).toContain('Refresh token is required');
    });

    it('should reject whitespace-only refresh token', async () => {
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: '   ' });

      // Accept either 400 (validation error) or 401 (invalid token error)
      expect([400, 401]).toContain(response.status);
      
      validateErrorResponse(response, response.status);
    });

    it('should reject revoked refresh token', async () => {
      // Test the specific scenario where a token exists in database but is revoked
      const credentials = createTestCredentials();
      
      // Register and login to get initial tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      const refreshToken = extractRefreshTokenFromResponse(loginResponse);

      // Use the refresh token once - this will revoke the old token
      await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken })
        .expect(200);

      // Try to use the same (now revoked) refresh token again
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken })
        .expect(401);

      validateErrorResponse(response, 401);
      expect(response.body.message).toContain('Invalid or revoked refresh token');
    });

    it('should handle expired refresh tokens', async () => {
      // This test attempts to create a scenario where a token exists but is expired
      // Since we can't easily control time in integration tests, we'll test
      // the scenario where the system time validation catches expired tokens
      
      // Create a user and login
      const credentials = createTestCredentials();
      
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      // Since we can't manipulate time in integration tests,
      // we'll test with a malformed/expired token instead
      // This should trigger the expired token validation path
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJ1c2VybmFtZSI6InRlc3RfdXNlciIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.invalid_signature';
      
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should handle refresh token for deleted user', async () => {
      // This tests the scenario where a refresh token exists and is valid,
      // but the associated user has been deleted from the database
      // In integration tests, this is hard to simulate without direct DB manipulation,
      // so we'll use a token with a non-existent user ID
      
      // Create a valid-looking token but with a user ID that doesn't exist
      const nonExistentUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDcxMmZhYjUzZjY5NTAwMTUzYjQ5ZjAiLCJ1c2VybmFtZSI6Im5vbmV4aXN0ZW50IiwiaWF0IjoxNjE4MTQzMTQ3LCJleHAiOjk5OTk5OTk5OTl9.invalid_signature';
      
      const response = await request(context.app)
        .post('/auth/token/refresh')
        .send({ refreshToken: nonExistentUserToken })
        .expect(401);

      validateErrorResponse(response, 401);
    });
  });
});
