import request, { Response } from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../setup';
import { validateAuthResponse, validateErrorResponse, createTestCredentials } from '../../../helpers';

describe('Auth Login Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = createTestCredentials();
      
      // First register a user
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      // Then login with the same credentials
      const response = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      validateAuthResponse(response);
      expect(response.body.user.username).toBe(credentials.username);
    });

    it('should return proper content type', async () => {
      const credentials = createTestCredentials();
      
      // Register user first
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      // Login and verify content type
      const loginResponse = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);
      
      expect(loginResponse.headers['content-type']).toMatch(/json/);
    });

    it('should reject login with invalid username', async () => {
      const credentials = createTestCredentials();
      
      // Register user first
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      // Try to login with wrong username
      const response = await request(context.app)
        .post('/auth/login')
        .send({
          username: 'wrongusername_' + Date.now(), // Ensure unique username
          password: credentials.password,
        })
        .expect(401);

      validateErrorResponse(response, 401, 'Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const credentials = createTestCredentials();
      
      // Register user first
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      // Try to login with wrong password
      const response = await request(context.app)
        .post('/auth/login')
        .send({
          username: credentials.username,
          password: 'wrongpassword',
        })
        .expect(401);

      validateErrorResponse(response, 401, 'Invalid credentials');
    });

    it('should reject login for non-existent user', async () => {
      const uniqueUsername = 'nonexistentuser_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      
      const response = await request(context.app)
        .post('/auth/login')
        .send({
          username: uniqueUsername,
          password: 'SomePassword123',
        })
        .expect(401);

      validateErrorResponse(response, 401, 'Invalid credentials');
    });

    it('should validate required fields', async () => {
      const response = await request(context.app)
        .post('/auth/login')
        .send({})
        .expect(400);

      validateErrorResponse(response, 400);
      const errorMessage = response.body.error || response.body.message;
      expect(errorMessage).toContain('Username is required');
      expect(errorMessage).toContain('Password is required');
    });

    it('should validate field types', async () => {
      const invalidRequests = [
        { username: 123, password: 'validpassword' },
        { username: 'validuser', password: 123 },
        { username: null, password: 'validpassword' },
        { username: 'validuser', password: null },
      ];

      for (const invalidRequest of invalidRequests) {
        const response = await request(context.app)
          .post('/auth/login')
          .send(invalidRequest)
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should generate different tokens for subsequent logins', async () => {
      const credentials = createTestCredentials();
      
      // Register user first
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      // First login
      const response1 = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      // Second login
      const response2 = await request(context.app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      validateAuthResponse(response1);
      validateAuthResponse(response2);

      // Tokens should be different (new tokens each time)
      expect(response1.body.accessToken).not.toBe(response2.body.accessToken);
      expect(response1.body.refreshToken).not.toBe(response2.body.refreshToken);
      
      // But user data should be the same
      expect(response1.body.user.id).toBe(response2.body.user.id);
      expect(response1.body.user.username).toBe(response2.body.user.username);
    });

    it('should handle multiple concurrent logins for same user', async () => {
      const credentials = createTestCredentials();
      
      // Register user first
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      // Multiple sequential logins
      const responses: Response[] = [];
      
      for (let i = 0; i < 3; i++) {
        const response = await request(context.app)
          .post('/auth/login')
          .send(credentials)
          .expect(200);
        
        responses.push(response);
        validateAuthResponse(response);
        expect(response.body.user.username).toBe(credentials.username);
      }
      
      // Verify they have different tokens
      const accessTokens = responses.map(r => r.body.accessToken);
      const refreshTokens = responses.map(r => r.body.refreshToken);
      
      expect(new Set(accessTokens).size).toBe(responses.length);
      expect(new Set(refreshTokens).size).toBe(responses.length);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(context.app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"username": "test", "password":}') // malformed JSON
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should handle empty request body', async () => {
      const response = await request(context.app)
        .post('/auth/login')
        .send()
        .expect(400);

      validateErrorResponse(response, 400);
    });
  });
});
