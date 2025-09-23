import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../setup';
import { validateErrorResponse } from '../../../helpers';
import { 
  createUserAndGetToken,
  createProjectViaAPI 
} from '../projectHelpers';

describe('Project Delete Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('DELETE /project/:projectId', () => {
    it('should delete project successfully when user owns it', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create a project
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .delete(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
    });

    it('should return proper content type', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      await request(context.app)
        .delete(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should require authentication', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .delete(`/project/${projectId}`)
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject invalid bearer token', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .delete(`/project/${projectId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should return 404 for non-existent project', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(context.app)
        .delete(`/project/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      validateErrorResponse(response, 404);
    });

    it('should return 400 for invalid project ID format', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const invalidId = 'invalid-id-format';
      
      const response = await request(context.app)
        .delete(`/project/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should return 403 when user tries to delete another users project', async () => {
      const { token: token1 } = await createUserAndGetToken(context.app);
      const { token: token2 } = await createUserAndGetToken(context.app);
      
      // Create project with user1
      const createResponse = await createProjectViaAPI(context.app, token1);
      const projectId = createResponse.body.id;
      
      // Try to delete with user2
      const response = await request(context.app)
        .delete(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      validateErrorResponse(response, 403);
    });

    it('should make project inaccessible after deletion', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create a project
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      // Verify project exists
      await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Delete the project
      await request(context.app)
        .delete(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify project no longer exists
      await request(context.app)
        .get(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should remove project from user project list after deletion', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create multiple projects
      const project1 = await createProjectViaAPI(context.app, token);
      const project2 = await createProjectViaAPI(context.app, token);
      const project3 = await createProjectViaAPI(context.app, token);
      
      // Verify all projects exist in list
      const initialListResponse = await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(initialListResponse.body.projects).toHaveLength(3);
      expect(initialListResponse.body.total).toBe(3);
      
      // Delete one project
      await request(context.app)
        .delete(`/project/${project2.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify project list is updated
      const updatedListResponse = await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(updatedListResponse.body.projects).toHaveLength(2);
      expect(updatedListResponse.body.total).toBe(2);
      
      // Verify the correct project was deleted
      const remainingIds = updatedListResponse.body.projects.map((p: { id: string }) => p.id);
      expect(remainingIds).toContain(project1.body.id);
      expect(remainingIds).toContain(project3.body.id);
      expect(remainingIds).not.toContain(project2.body.id);
    });

    it('should handle deletion of already deleted project', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      // First deletion should succeed
      await request(context.app)
        .delete(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Second deletion should return 404
      const response = await request(context.app)
        .delete(`/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      validateErrorResponse(response, 404);
    });

    it('should handle concurrent deletion attempts', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      // Make concurrent deletion requests
      const deletionPromises = Array.from({ length: 3 }, () =>
        request(context.app)
          .delete(`/project/${projectId}`)
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(deletionPromises);
      
      // One should succeed (200), others may fail with 404 or 423 (transaction conflict)
      const successCount = responses.filter(r => r.status === 200).length;
      const notFoundCount = responses.filter(r => r.status === 404).length;
      const conflictCount = responses.filter(r => r.status === 423).length;
      
      expect(successCount).toBe(1);
      expect(notFoundCount + conflictCount).toBe(2);
      expect(successCount + notFoundCount + conflictCount).toBe(3);
    });

    it('should handle deletion of multiple different projects', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create multiple projects
      const projects = await Promise.all([
        createProjectViaAPI(context.app, token),
        createProjectViaAPI(context.app, token),
        createProjectViaAPI(context.app, token)
      ]);
      
      // Delete each project
      for (const project of projects) {
        const response = await request(context.app)
          .delete(`/project/${project.body.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
          
        expect(response.body.message).toContain('deleted');
      }
      
      // Verify all projects are deleted
      const listResponse = await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(listResponse.body.projects).toHaveLength(0);
      expect(listResponse.body.total).toBe(0);
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
          .delete(`/project/${id}`)
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
          .delete(`/project/${id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400);

        validateErrorResponse(response, 400);
      }

      // Empty string case - should return 404 because route /project/ doesn't match /project/:projectId
      const emptyResponse = await request(context.app)
        .delete('/project/')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      validateErrorResponse(emptyResponse, 404);
    });

    it('should not leak information about projects owned by other users', async () => {
      const { token: token1 } = await createUserAndGetToken(context.app);
      const { token: token2 } = await createUserAndGetToken(context.app);
      
      // Create project with user1
      const createResponse = await createProjectViaAPI(context.app, token1);
      const projectId = createResponse.body.id;
      
      // Try to delete with user2 - should get 403, not 404
      const response = await request(context.app)
        .delete(`/project/${projectId}`)
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
        .delete(`/project/${encodedId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');
    });

    it('should not affect other users projects when deleting', async () => {
      const { token: token1 } = await createUserAndGetToken(context.app);
      const { token: token2 } = await createUserAndGetToken(context.app);
      
      // Create projects for both users
      const user1Project = await createProjectViaAPI(context.app, token1);
      const user2Project = await createProjectViaAPI(context.app, token2);
      
      // Delete user1's project
      await request(context.app)
        .delete(`/project/${user1Project.body.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      
      // Verify user2's project still exists
      await request(context.app)
        .get(`/project/${user2Project.body.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);
      
      // Verify user2's project list is unchanged
      const user2ListResponse = await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);
      
      expect(user2ListResponse.body.projects).toHaveLength(1);
      expect(user2ListResponse.body.projects[0].id).toBe(user2Project.body.id);
    });

    it('should handle deletion with malformed authorization header', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      const projectId = createResponse.body.id;
      
      const response = await request(context.app)
        .delete(`/project/${projectId}`)
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      validateErrorResponse(response, 401);
    });
  });
});
