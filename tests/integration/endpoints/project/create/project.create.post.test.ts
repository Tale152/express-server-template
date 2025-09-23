import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../../setup';
import { validateErrorResponse } from '../../../helpers';
import { 
  createTestProject, 
  validateProjectResponse, 
  createUserAndGetToken 
} from '../projectHelpers';

describe('Project Create Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('POST /project', () => {
    it('should create a new project successfully', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const projectData = createTestProject();
      
      const response = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(201);

      validateProjectResponse(response);
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.gitUrl).toBe(projectData.gitUrl);
    });

    it('should return proper content type', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const projectData = createTestProject();
      
      await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(201)
        .expect('Content-Type', /json/);
    });

    it('should require authentication', async () => {
      const projectData = createTestProject();
      
      const response = await request(context.app)
        .post('/project')
        .send(projectData)
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject invalid bearer token', async () => {
      const projectData = createTestProject();
      
      const response = await request(context.app)
        .post('/project')
        .set('Authorization', 'Bearer invalid-token')
        .send(projectData)
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should reject malformed authorization header', async () => {
      const projectData = createTestProject();
      
      const response = await request(context.app)
        .post('/project')
        .set('Authorization', 'InvalidFormat token')
        .send(projectData)
        .expect(401);

      validateErrorResponse(response, 401);
    });

    it('should validate required fields', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const response = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      validateErrorResponse(response, 400);
      const errorMessage = response.body.error || response.body.message;
      expect(errorMessage).toContain('Project name is required');
      expect(errorMessage).toContain('Git URL is required');
    });

    it('should validate project name format', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const invalidNames = [
        '', // empty string
        'a'.repeat(101), // too long
        123, // not a string
        null, // null value
      ];

      for (const name of invalidNames) {
        const response = await request(context.app)
          .post('/project')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name,
            gitUrl: 'https://github.com/user/repo.git',
          })
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should validate git URL format', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const invalidGitUrls = [
        '', // empty string
        123, // not a string
        null, // null value
      ];

      for (const gitUrl of invalidGitUrls) {
        const response = await request(context.app)
          .post('/project')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Valid Project Name',
            gitUrl,
          })
          .expect(400);

        validateErrorResponse(response, 400);
      }
    });

    it('should handle multiple projects for same user', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const project1 = createTestProject();
      const project2 = createTestProject();

      const response1 = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .send(project1)
        .expect(201);

      const response2 = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .send(project2)
        .expect(201);

      validateProjectResponse(response1);
      validateProjectResponse(response2);

      // Should have different IDs
      expect(response1.body.id).not.toBe(response2.body.id);
      
      // Should have same userId
      expect(response1.body.userId).toBe(response2.body.userId);
    });

    it('should allow same project name for different users', async () => {
      const { token: token1 } = await createUserAndGetToken(context.app);
      const { token: token2 } = await createUserAndGetToken(context.app);
      
      const projectData = createTestProject();

      const response1 = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token1}`)
        .send(projectData)
        .expect(201);

      const response2 = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token2}`)
        .send(projectData)
        .expect(201);

      validateProjectResponse(response1);
      validateProjectResponse(response2);

      // Should have different IDs and userIds
      expect(response1.body.id).not.toBe(response2.body.id);
      expect(response1.body.userId).not.toBe(response2.body.userId);
      
      // Should have same name and gitUrl
      expect(response1.body.name).toBe(response2.body.name);
      expect(response1.body.gitUrl).toBe(response2.body.gitUrl);
    });

    it('should handle concurrent project creation', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const projects = Array.from({ length: 3 }, () => createTestProject());
      
      const creationPromises = projects.map(project => 
        request(context.app)
          .post('/project')
          .set('Authorization', `Bearer ${token}`)
          .send(project)
          .expect(201)
      );

      const responses = await Promise.all(creationPromises);
      
      responses.forEach((response, index) => {
        validateProjectResponse(response);
        expect(response.body.name).toBe(projects[index].name);
        expect(response.body.gitUrl).toBe(projects[index].gitUrl);
      });

      // All projects should have unique IDs
      const projectIds = responses.map(r => r.body.id);
      const uniqueIds = new Set(projectIds);
      expect(uniqueIds.size).toBe(projectIds.length);
    });

    it('should validate request body structure', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const response = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .send('invalid json')
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should handle malformed JSON', async () => {
      const { token } = await createUserAndGetToken(context.app);
      
      const response = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"name": "test", "gitUrl":}') // malformed JSON
        .expect(400);

      validateErrorResponse(response, 400);
    });

    it('should include timestamps in response', async () => {
      const { token } = await createUserAndGetToken(context.app);
      const projectData = createTestProject();
      
      const response = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(201);

      validateProjectResponse(response);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
      
      // Check that timestamps are valid dates
      expect(new Date(response.body.createdAt).getTime()).not.toBeNaN();
      expect(new Date(response.body.updatedAt).getTime()).not.toBeNaN();
    });

    it('should set userId correctly from authenticated user', async () => {
      const { token, user } = await createUserAndGetToken(context.app);
      const projectData = createTestProject();
      
      const response = await request(context.app)
        .post('/project')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(201);

      validateProjectResponse(response);
      expect(response.body.userId).toBe(user.id);
    });
  });
});
