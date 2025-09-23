import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../setup';
import { validateErrorResponse } from '../../../helpers';
import { 
  validateProjectListResponse, 
  createUserAndGetToken,
  createProjectViaAPI 
} from '../projectHelpers';

describe('Project List Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('GET /project/list', () => {
    it('should return empty list when user has no projects', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const response = await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.projects).toHaveLength(0);
      expect(response.body.total).toBe(0);
      expect(response.body.totalPages).toBe(0);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should return user projects with default pagination', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create some projects
      await createProjectViaAPI(context.app, token);
      await createProjectViaAPI(context.app, token);
      await createProjectViaAPI(context.app, token);
      
      const response = await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.projects).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should return proper content type', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should require authentication', async () => {
      const response = await request(context.app)
        .get('/project/list')
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject invalid bearer token', async () => {
      const response = await request(context.app)
        .get('/project/list')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should handle custom pagination parameters', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create 5 projects
      for (let i = 0; i < 5; i++) {
        await createProjectViaAPI(context.app, token);
      }
      
      const response = await request(context.app)
        .get('/project/list?page=1&limit=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.projects).toHaveLength(3);
      expect(response.body.total).toBe(5);
      expect(response.body.totalPages).toBe(2);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.limit).toBe(3);
    });

    it('should handle second page of results', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create 5 projects
      for (let i = 0; i < 5; i++) {
        await createProjectViaAPI(context.app, token);
      }
      
      const response = await request(context.app)
        .get('/project/list?page=2&limit=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.projects).toHaveLength(2);
      expect(response.body.total).toBe(5);
      expect(response.body.totalPages).toBe(2);
      expect(response.body.currentPage).toBe(2);
      expect(response.body.limit).toBe(3);
    });

    it('should handle page beyond available data', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create 2 projects
      await createProjectViaAPI(context.app, token);
      await createProjectViaAPI(context.app, token);
      
      const response = await request(context.app)
        .get('/project/list?page=5&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.projects).toHaveLength(0);
      expect(response.body.total).toBe(2);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.currentPage).toBe(5);
      expect(response.body.limit).toBe(10);
    });

    it('should use default values for invalid pagination parameters', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      await createProjectViaAPI(context.app, token);
      
      const response = await request(context.app)
        .get('/project/list?page=invalid&limit=invalid')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should handle zero and negative pagination parameters', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      await createProjectViaAPI(context.app, token);
      
      const response = await request(context.app)
        .get('/project/list?page=0&limit=-5')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.limit).toBe(1);
    });

    it('should only return projects belonging to authenticated user', async () => {
      const { token: token1, user: user1 } = await createUserAndGetToken(context.app);
      const { token: token2 } = await createUserAndGetToken(context.app);
      
      // Create projects for both users
      await createProjectViaAPI(context.app, token1);
      await createProjectViaAPI(context.app, token1);
      await createProjectViaAPI(context.app, token2);
      
      const response = await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.projects).toHaveLength(2);
      expect(response.body.total).toBe(2);
      
      // All projects should belong to user1
      response.body.projects.forEach((project: { userId: string }) => {
        expect(project.userId).toBe(user1.id);
      });
    });

    it('should handle large page numbers gracefully', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      await createProjectViaAPI(context.app, token);
      
      const response = await request(context.app)
        .get('/project/list?page=999999&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.projects).toHaveLength(0);
      expect(response.body.currentPage).toBe(999999);
    });

    it('should handle large limit values', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create a few projects
      for (let i = 0; i < 3; i++) {
        await createProjectViaAPI(context.app, token);
      }
      
      const response = await request(context.app)
        .get('/project/list?page=1&limit=1000')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      expect(response.body.projects).toHaveLength(3);
      expect(response.body.limit).toBe(100);
    });

    it('should include all required project fields in response', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const createResponse = await createProjectViaAPI(context.app, token);
      
      const listResponse = await request(context.app)
        .get('/project/list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(listResponse);
      expect(listResponse.body.projects).toHaveLength(1);
      
      const project = listResponse.body.projects[0];
      expect(project.id).toBe(createResponse.body.id);
      expect(project.name).toBe(createResponse.body.name);
      expect(project.gitUrl).toBe(createResponse.body.gitUrl);
      expect(project.userId).toBe(createResponse.body.userId);
    });

    it('should handle concurrent requests from same user', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      // Create some projects
      for (let i = 0; i < 3; i++) {
        await createProjectViaAPI(context.app, token);
      }
      
      // Make concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        request(context.app)
          .get('/project/list')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        validateProjectListResponse(response);
        expect(response.body.projects).toHaveLength(3);
        expect(response.body.total).toBe(3);
      });
    });

    it('should handle malformed query parameters gracefully', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      await createProjectViaAPI(context.app, token);
      
      const response = await request(context.app)
        .get('/project/list?page=abc&limit=xyz&extra=ignored')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      validateProjectListResponse(response);
      // Should use default values
      expect(response.body.currentPage).toBe(1);
      expect(response.body.limit).toBe(10);
    });
  });
});
