import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../setup';
import { validateErrorResponse } from '../../../helpers';
import { 
  validateProjectResponse, 
  createUserAndGetToken,
  createProjectViaAPI 
} from '../../../projectHelpers';

describe('Project Update Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('PUT /project/:projectId', () => {
    it('should update project successfully when user owns it', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create a project
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const updateData = {
        name: 'Updated Project Name',
        gitUrl: 'https://github.com/user/updated-repo.git'
      };
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.id).toBe(projectId);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.gitUrl).toBe(updateData.gitUrl);
      expect(response.body.userId).toBe(createResponse.body.userId);
    });

    it('should update only name when only name is provided', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const updateData = {
        name: 'Updated Name Only'
      };
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.gitUrl).toBe(createResponse.body.gitUrl); // Should remain unchanged
    });

    it('should update only gitUrl when only gitUrl is provided', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const updateData = {
        gitUrl: 'https://github.com/user/new-url.git'
      };
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.name).toBe(createResponse.body.name); // Should remain unchanged
      expect(response.body.gitUrl).toBe(updateData.gitUrl);
    });

    it('should return proper content type', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should require authentication', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .send({ name: 'Updated Name' })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject invalid bearer token', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Updated Name' })
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should return 404 for non-existent project', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(context.app)
        .put(`/project/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      validateErrorResponse(response, 404);
    });

    it('should return 400 for invalid project ID format', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const invalidId = 'invalid-id-format';
      
      const response = await request(context.app)
        .put(`/project/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should return 403 when user tries to update another users project', async () => {
      const { token: token1 } = await createUserAndGetToken(context.app);
      const { token: token2 } = await createUserAndGetToken(context.app);
      
      // Create project with user1
      const createResponse = await createProjectViaAPI(context.app, token1);
      const projectId = createResponse.body.id;
      
      // Try to update with user2
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ name: 'Hacked Name' })
        .expect(403);

      validateErrorResponse(response, 403);
    });

    it('should validate name field when provided', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const invalidNames = [
        '', // empty string
        'a'.repeat(101), // too long
        123, // not a string
        null, // null value
      ];

      for (const name of invalidNames) {
        const response = await request(context.app)
          .put(`/project/${projectId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name })
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should validate gitUrl field when provided', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const invalidGitUrls = [
        '', // empty string
        123, // not a string
        null, // null value
      ];

      for (const gitUrl of invalidGitUrls) {
        const response = await request(context.app)
          .put(`/project/${projectId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ gitUrl })
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should accept empty update object', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);

      validateProjectResponse(response);
      // Values should remain unchanged
      expect(response.body.name).toBe(createResponse.body.name);
      expect(response.body.gitUrl).toBe(createResponse.body.gitUrl);
    });

    it('should update updatedAt timestamp', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      const originalUpdatedAt = createResponse.body.updatedAt;
      
      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.updatedAt).not.toBe(originalUpdatedAt);
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('should not modify createdAt timestamp', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      const originalCreatedAt = createResponse.body.createdAt;
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.createdAt).toBe(originalCreatedAt);
    });

    it('should not modify userId', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      const originalUserId = createResponse.body.userId;
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          name: 'Updated Name',
          gitUrl: 'https://github.com/updated/repo.git'
        })
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.userId).toBe(originalUserId);
    });

    it('should handle concurrent updates to same project', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      // Make concurrent update requests
      const updates = [
        { name: 'Update 1' },
        { name: 'Update 2' },
        { gitUrl: 'https://github.com/user/update1.git' },
        { gitUrl: 'https://github.com/user/update2.git' }
      ];
      
      const updatePromises = updates.map(update =>
        request(context.app)
          .put(`/project/${projectId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(update)
      );

      const responses = await Promise.all(updatePromises);
      
      // Some requests should succeed (200), others may conflict (423)
      let successCount = 0;
      let conflictCount = 0;
      
      responses.forEach(response => {
        if (response.status === 200) {
          successCount++;
          validateProjectResponse(response);
          expect(response.body.id).toBe(projectId);
        } else if (response.status === 423) {
          conflictCount++;
          validateErrorResponse(response, 423);
        } else {
          fail(`Unexpected status code: ${response.status}`);
        }
      });
      
      // At least one should succeed, some may conflict
      expect(successCount).toBeGreaterThanOrEqual(1);
      expect(successCount + conflictCount).toBe(updates.length);
    });

    it('should ignore unknown fields in update', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          unknownField: 'should be ignored',
          anotherField: 123
        })
        .expect(200);

      validateProjectResponse(response);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body).not.toHaveProperty('unknownField');
      expect(response.body).not.toHaveProperty('anotherField');
    });

    it('should handle malformed JSON', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"name": "test", "gitUrl":}') // malformed JSON
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should handle multiple sequential updates', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      // First update
      const response1 = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'First Update' })
        .expect(200);
      
      // Second update
      const response2 = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ gitUrl: 'https://github.com/user/second-update.git' })
        .expect(200);
      
      // Third update
      const response3 = await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          name: 'Final Update',
          gitUrl: 'https://github.com/user/final-update.git'
        })
        .expect(200);

      validateProjectResponse(response1);
      validateProjectResponse(response2);
      validateProjectResponse(response3);
      
      expect(response1.body.name).toBe('First Update');
      expect(response2.body.name).toBe('First Update'); // Should remain from previous update
      expect(response2.body.gitUrl).toBe('https://github.com/user/second-update.git');
      expect(response3.body.name).toBe('Final Update');
      expect(response3.body.gitUrl).toBe('https://github.com/user/final-update.git');
    });

    it('should preserve original data when validation fails', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      const originalName = createResponse.body.name;
      const originalGitUrl = createResponse.body.gitUrl;
      
      // Try to update with invalid data
      await request(context.app)
        .put(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' }) // invalid empty name
        .expect(400);
      
      // Verify original data is preserved
      const getResponse = await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getResponse.body.name).toBe(originalName);
      expect(getResponse.body.gitUrl).toBe(originalGitUrl);
    });
  });
});
