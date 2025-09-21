import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../setup';
import { validateErrorResponse, createTestCredentials } from '../../../helpers';

describe('Auth Logout Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('POST /auth/logout', () => {
    it('should logout with valid tokens', async () => {
      const credentials = createTestCredentials();
      
      // Register and login to get valid tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);
      
      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');

      const { accessToken, refreshToken } = loginResponse.body;

      // Logout with valid tokens
      const logoutResponse = await request(context.app)
        .post('/auth/logout')
        .send({ accessToken, refreshToken })
        .expect(200);

      expect(logoutResponse.body).toHaveProperty('message', 'Logout successful');
      expect(logoutResponse.body).toHaveProperty('loggedOutAt');
      expect(new Date(logoutResponse.body.loggedOutAt).getTime()).not.toBeNaN();
    });

    it('should return proper content type', async () => {
      const credentials = createTestCredentials();
      
      // Register and login to get valid tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);
      
      const { accessToken, refreshToken } = loginResponse.body;

      const logoutResponse = await request(context.app)
        .post('/auth/logout')
        .send({ accessToken, refreshToken })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(logoutResponse.body.message).toBe('Logout successful');
    });

    it('should reject logout with invalid access token', async () => {
      const credentials = createTestCredentials();
      
      // Get valid refresh token but use invalid access token
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);
      
      const { refreshToken } = loginResponse.body;

      const response = await request(context.app)
        .post('/auth/logout')
        .send({ 
          accessToken: 'invalid.access.token',
          refreshToken 
        })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject logout with invalid refresh token', async () => {
      const credentials = createTestCredentials();
      
      // Get valid access token but use invalid refresh token
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);
      
      const { accessToken } = loginResponse.body;

      const response = await request(context.app)
        .post('/auth/logout')
        .send({ 
          accessToken,
          refreshToken: 'invalid.refresh.token'
        })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject logout with both invalid tokens', async () => {
      const response = await request(context.app)
        .post('/auth/logout')
        .send({ 
          accessToken: 'invalid.access.token',
          refreshToken: 'invalid.refresh.token'
        })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should validate required fields', async () => {
      // Missing accessToken
      const response1 = await request(context.app)
        .post('/auth/logout')
        .send({ refreshToken: 'some.refresh.token' })
        .expect(400);

      validateErrorResponse(response1, 400);

      // Missing refreshToken
      const response2 = await request(context.app)
        .post('/auth/logout')
        .send({ accessToken: 'some.access.token' })
        .expect(400);

      validateErrorResponse(response2, 400);

      // Missing both
      const response3 = await request(context.app)
        .post('/auth/logout')
        .send({})
        .expect(400);

      validateErrorResponse(response3, 400);
    });

    it('should validate field types', async () => {
      // Non-string accessToken
      const response1 = await request(context.app)
        .post('/auth/logout')
        .send({ 
          accessToken: 123,
          refreshToken: 'some.refresh.token'
        })
        .expect(400);

      validateErrorResponse(response1, 400);

      // Non-string refreshToken
      const response2 = await request(context.app)
        .post('/auth/logout')
        .send({ 
          accessToken: 'some.access.token',
          refreshToken: 123
        })
        .expect(400);

      validateErrorResponse(response2, 400);
    });

    it('should handle logout with tokens from different users gracefully', async () => {
      // This test verifies that tokens from different users are handled properly
      const credentials1 = createTestCredentials();
      const credentials2 = createTestCredentials();
      
      // Register and login first user
      await request(context.app)
        .post('/auth/register')
        .send(credentials1)
        .expect(201);

      const login1Response = await request(context.app)
        .post('/auth/login')
        .send(credentials1)
        .expect(200);

      // Register and login second user
      await request(context.app)
        .post('/auth/register')
        .send(credentials2)
        .expect(201);

      const login2Response = await request(context.app)
        .post('/auth/login')
        .send(credentials2)
        .expect(200);

      // Try to logout with mixed tokens (access from user1, refresh from user2)
      const response = await request(context.app)
        .post('/auth/logout')
        .send({ 
          accessToken: login1Response.body.accessToken,
          refreshToken: login2Response.body.refreshToken
        })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should handle multiple logout attempts gracefully', async () => {
      const credentials = createTestCredentials();
      
      // Register and login to get valid tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);
      
      const { accessToken, refreshToken } = loginResponse.body;

      // First logout should succeed
      const firstLogout = await request(context.app)
        .post('/auth/logout')
        .send({ accessToken, refreshToken })
        .expect(200);

      expect(firstLogout.body.message).toBe('Logout successful');

      // Second logout should also succeed (200) to avoid exposing token state information
      const secondLogout = await request(context.app)
        .post('/auth/logout')
        .send({ accessToken, refreshToken })
        .expect(200);

      expect(secondLogout.body.message).toBe('Logout successful');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(context.app)
        .post('/auth/logout')
        .send('invalid json')
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should handle empty request body', async () => {
      const response = await request(context.app)
        .post('/auth/logout')
        .send()
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should handle tokens that exist in database but belong to different users', async () => {
      // This test targets the token mismatch scenario in revokeTokenIfValid
      // We'll create two users, get their tokens, then try to logout with mixed tokens where
      // the tokens themselves are valid but the stored tokens in DB belong to different users
      const credentials1 = createTestCredentials();
      const credentials2 = createTestCredentials();
      
      // Register and login first user
      await request(context.app)
        .post('/auth/register')
        .send(credentials1)
        .expect(201);

      const login1Response = await request(context.app)
        .post('/auth/login')
        .send(credentials1)
        .expect(200);

      // Register and login second user
      await request(context.app)
        .post('/auth/register')
        .send(credentials2)
        .expect(201);

      const login2Response = await request(context.app)
        .post('/auth/login')
        .send(credentials2)
        .expect(200);

      // Get tokens from different users but craft a scenario where JWT validation passes
      // but database validation fails due to token mismatch
      // This will happen when we try to logout with access/refresh tokens from different users
      const response = await request(context.app)
        .post('/auth/logout')
        .send({ 
          accessToken: login1Response.body.accessToken,
          refreshToken: login2Response.body.refreshToken
        })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should handle already revoked tokens gracefully', async () => {
      // Test that logging out with already revoked tokens works gracefully
      const credentials = createTestCredentials();
      
      // Register and login to get valid tokens
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);
      
      const { accessToken, refreshToken } = loginResponse.body;

      // First logout should succeed and revoke tokens
      await request(context.app)
        .post('/auth/logout')
        .send({ accessToken, refreshToken })
        .expect(200);

      // Second logout with same tokens should still succeed (graceful handling)
      // This tests the "isRevoked" branch in revokeTokenIfValid
      const secondLogoutResponse = await request(context.app)
        .post('/auth/logout')
        .send({ accessToken, refreshToken })
        .expect(200);

      expect(secondLogoutResponse.body.message).toBe('Logout successful');
    });
  });
});
