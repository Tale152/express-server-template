import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../setup';
import { validateErrorResponse } from '../../../helpers';
import { 
  validateProjectResponse, 
  createUserAndGetToken,
  createProjectViaAPI 
} from '../../../projectHelpers';

describe('Project Get Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('GET /project/:projectId', () => {
    it('should return project successfully when user owns it', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create a project
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.id).toBe(projectId);
      expect(response.body.name).toBe(createResponse.body.name);
      expect(response.body.gitUrl).toBe(createResponse.body.gitUrl);
      expect(response.body.userId).toBe(createResponse.body.userId);
    });

    it('should return proper content type', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should require authentication', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .get(`/project/${projectId}`)
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject invalid bearer token', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should return 404 for non-existent project', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(context.app)
        .get(`/project/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      validateErrorResponse(response, 404);
    });

    it('should return 400 for invalid project ID format', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const invalidId = 'invalid-id-format';
      
      const response = await request(context.app)
        .get(`/project/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should return 403 when user tries to access another users project', async () => {
      const { token: token1 } = await createUserAndGetToken(context.app);
      const { token: token2 } = await createUserAndGetToken(context.app);
      
      // Create project with user1
      const createResponse = await createProjectViaAPI(context.app, token1);
      const projectId = createResponse.body.id;
      
      // Try to access with user2
      const response = await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      validateErrorResponse(response, 403);
    });

    it('should include all project fields in response', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectResponse(response);
      
      // Verify all fields match the created project
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.name).toBe(createResponse.body.name);
      expect(response.body.gitUrl).toBe(createResponse.body.gitUrl);
      expect(response.body.userId).toBe(createResponse.body.userId);
      expect(response.body.createdAt).toBe(createResponse.body.createdAt);
      expect(response.body.updatedAt).toBe(createResponse.body.updatedAt);
    });

    it('should handle concurrent requests for same project', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      // Make concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        request(context.app)
          .get(`/project/${projectId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        validateProjectResponse(response);
        expect(response.body.id).toBe(projectId);
      });
    });

    it('should handle multiple different projects', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create multiple projects
      const project1 = await createProjectViaAPI(context.app, token);
      const project2 = await createProjectViaAPI(context.app, token);
      const project3 = await createProjectViaAPI(context.app, token);
      
      // Retrieve each project
      const response1 = await request(context.app)
        .get(`/project/${project1.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      const response2 = await request(context.app)
        .get(`/project/${project2.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      const response3 = await request(context.app)
        .get(`/project/${project3.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Validate all responses
      [response1, response2, response3].forEach(response => {
        validateProjectResponse(response);
      });

      // Verify correct projects are returned
      expect(response1.body.id).toBe(project1.body.id);
      expect(response2.body.id).toBe(project2.body.id);
      expect(response3.body.id).toBe(project3.body.id);
    });

    it('should handle edge case MongoDB ObjectId formats', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const edgeCaseIds = [
        '000000000000000000000000', // All zeros
        'ffffffffffffffffffffffff', // All f's (but lowercase)
        'FFFFFFFFFFFFFFFFFFFFFFFF', // All F's (uppercase)
      ];

      for (const id of edgeCaseIds) {
        const response = await request(context.app)
          .get(`/project/${id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);

        validateErrorResponse(response, 404);
      }
    });

    it('should handle various invalid ID formats', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const invalidIds = [
        'short',
        'way-too-long-to-be-a-valid-mongodb-objectid-format',
        '507f1f77bcf86cd79943901g', // contains invalid hex character
        '507f1f77-bcf8-6cd7-9943-9011', // UUID format
        '123',
      ];

      for (const id of invalidIds) {
        const response = await request(context.app)
          .get(`/project/${id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should not leak information about projects owned by other users', async () => {
      const { token: token1 } = await createUserAndGetToken(context.app);
      const { token: token2 } = await createUserAndGetToken(context.app);
      
      // Create project with user1
      const createResponse = await createProjectViaAPI(context.app, token1);
      const projectId = createResponse.body.id;
      
      // Try to access with user2 - should get 403, not 404
      const response = await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      validateErrorResponse(response, 403);
      
      // Error message should not reveal project details
      const errorMessage = response.body.error || response.body.message;
      expect(errorMessage.toLowerCase()).not.toContain(createResponse.body.name.toLowerCase());
      expect(errorMessage.toLowerCase()).not.toContain('git');
    });

    it('should handle special characters in URLs correctly', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      // Test URL encoding/decoding
      const encodedId = encodeURIComponent(projectId);
      
      const response = await request(context.app)
        .get(`/project/${encodedId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.id).toBe(projectId);
    });
  });
});
