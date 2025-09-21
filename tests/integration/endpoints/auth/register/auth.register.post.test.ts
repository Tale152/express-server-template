import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../setup';
import { validateAuthResponse, validateErrorResponse, createTestCredentials } from '../../../helpers';

describe('Auth Register Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const credentials = createTestCredentials();
      
      const response = await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      validateAuthResponse(response);
      expect(response.body.user.username).toBe(credentials.username);
    });

    it('should return proper content type', async () => {
      const credentials = createTestCredentials();
      
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201)
        .expect('Content-Type', /json/);
    });

    it('should prevent duplicate username registration', async () => {
      const credentials = createTestCredentials();
      
      // First registration should succeed
      await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      // Second registration with same username should fail
      const response = await request(context.app)
        .post('/auth/register')
        .send(credentials)
        .expect(409);

      validateErrorResponse(response, 409);
    });

    it('should validate required fields', async () => {
      const response = await request(context.app)
        .post('/auth/register')
        .send({})
        .expect(400);

      validateErrorResponse(response, 400);
      const errorMessage = response.body.error || response.body.message;
      expect(errorMessage).toContain('Username is required');
      expect(errorMessage).toContain('Password is required');
    });

    it('should validate username format', async () => {
      const invalidUsernames = [
        'ab', // too short
        'user@domain.com', // invalid characters
        'user with spaces', // spaces not allowed
        'a'.repeat(51), // too long
      ];

      for (const username of invalidUsernames) {
        const response = await request(context.app)
          .post('/auth/register')
          .send({
            username,
            password: 'ValidPassword123',
          })
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should validate password strength', async () => {
      const invalidPasswords = [
        'short', // too short
        'nouppercase123', // no uppercase
        'NOLOWERCASE123', // no lowercase
        'NoNumbers!', // no numbers
      ];

      for (const password of invalidPasswords) {
        const response = await request(context.app)
          .post('/auth/register')
          .send({
            username: `testuser${Math.random()}`,
            password,
          })
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should handle multiple concurrent registrations with different usernames', async () => {
      const registrations = Array.from({ length: 3 }, (_, i) => {
        return request(context.app)
          .post('/auth/register')
          .send({
            username: `testuser${i}`,
            password: 'ValidPassword123',
          })
          .expect(201);
      });

      const responses = await Promise.all(registrations);
      
      responses.forEach((response, i) => {
        validateAuthResponse(response);
        expect(response.body.user.username).toBe(`testuser${i}`);
      });
    });

    it('should generate different tokens for different users', async () => {
      const credentials1 = createTestCredentials();
      const credentials2 = createTestCredentials();

      const response1 = await request(context.app)
        .post('/auth/register')
        .send(credentials1)
        .expect(201);

      const response2 = await request(context.app)
        .post('/auth/register')
        .send(credentials2)
        .expect(201);

      validateAuthResponse(response1);
      validateAuthResponse(response2);

      // Tokens should be different
      expect(response1.body.accessToken).not.toBe(response2.body.accessToken);
      expect(response1.body.refreshToken).not.toBe(response2.body.refreshToken);
      
      // User IDs should be different
      expect(response1.body.user.id).not.toBe(response2.body.user.id);
    });

    it('should validate request body structure', async () => {
      const response = await request(context.app)
        .post('/auth/register')
        .send('invalid json')
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(context.app)
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"username": "test", "password":}') // malformed JSON
        .expect(400);

      validateErrorResponse(response, 400);
    });
  });
});
