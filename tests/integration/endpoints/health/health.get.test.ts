import request from 'supertest';
import { setupIntegrationTest, IntegrationTestContext } from '../../setup';
import { GetHealthResponse } from '../../../../src/dto/health/GetHealthResponse';

/**
 * Validate health response structure
 */
const validateHealthResponse = (response: { body: GetHealthResponse }) => {
  expect(response.body).toHaveProperty('status');
  expect(typeof response.body.status).toBe('string');
  expect(response.body.status).toBe('OK');
};

describe('Health Endpoint Integration Tests', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTest();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(context.app)
        .get('/health')
        .expect(200);

      validateHealthResponse(response);
    });

    it('should return health status with proper content type', async () => {
      const response = await request(context.app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      validateHealthResponse(response);
    });

    it('should return response within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(context.app)
        .get('/health')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      validateHealthResponse(response);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should return consistent structure across multiple calls', async () => {
      const response1 = await request(context.app)
        .get('/health')
        .expect(200);

      const response2 = await request(context.app)
        .get('/health')
        .expect(200);

      // Validate both responses
      validateHealthResponse(response1);
      validateHealthResponse(response2);

      // Both responses should have the same structure
      expect(Object.keys(response1.body).sort()).toEqual(Object.keys(response2.body).sort());
    });

    it('should handle concurrent requests properly', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(context.app)
          .get('/health')
          .expect(200)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        validateHealthResponse(response);
      });
    });

    it('should return proper security headers', async () => {
      const response = await request(context.app)
        .get('/health')
        .expect(200);

      // Verify security headers are present (set by Helmet middleware)
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      
      validateHealthResponse(response);
    });

    it('should handle invalid query parameters gracefully', async () => {
      const response = await request(context.app)
        .get('/health?invalid=parameter&another=test')
        .expect(200);

      validateHealthResponse(response);
    });

    it('should not accept POST requests', async () => {
      await request(context.app)
        .post('/health')
        .expect(404); // Should return 404 for unsupported methods
    });

    it('should not accept PUT requests', async () => {
      await request(context.app)
        .put('/health')
        .expect(404); // Should return 404 for unsupported methods
    });

    it('should not accept DELETE requests', async () => {
      await request(context.app)
        .delete('/health')
        .expect(404); // Should return 404 for unsupported methods
    });
  });
});
