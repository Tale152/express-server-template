import { Application } from 'express';
import { setupSwaggerUi } from '../../../src/setup/swagger';
import fs from 'fs';
import path from 'path';

// Mock dependencies
jest.mock('swagger-ui-express', () => ({
  serve: jest.fn(),
  setup: jest.fn()
}));
jest.mock('fs');
jest.mock('path');

describe('swagger setup', () => {
  let mockApp: jest.Mocked<Application>;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockApp = {
      use: jest.fn(),
      get: jest.fn()
    } as unknown as jest.Mocked<Application>;
    
    mockFs = fs as jest.Mocked<typeof fs>;
    
    // Mock path.join to return a predictable path
    jest.spyOn(path, 'join').mockReturnValue('/mock/path/swagger.json');
  });

  describe('setupSwaggerUi', () => {
    it('should setup swagger UI when swagger.json exists', () => {
      const mockSwaggerDocument = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' }
      };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockSwaggerDocument));

      setupSwaggerUi(mockApp);

      expect(mockFs.existsSync).toHaveBeenCalledWith('/mock/path/swagger.json');
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/mock/path/swagger.json', 'utf8');
      expect(mockApp.use).toHaveBeenCalledWith('/docs', expect.any(Function), undefined);
    });

    it('should setup fallback route when swagger.json does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      setupSwaggerUi(mockApp);

      expect(mockFs.existsSync).toHaveBeenCalledWith('/mock/path/swagger.json');
      expect(mockApp.get).toHaveBeenCalledWith('/docs', expect.any(Function));
      expect(mockApp.use).not.toHaveBeenCalled();
    });

    it('should send HTML message in fallback route', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const mockRes = {
        send: jest.fn()
      };
      
      setupSwaggerUi(mockApp);
      
      // Get the callback function that was passed to app.get
      const getCallback = (mockApp.get as jest.Mock).mock.calls[0][1];
      getCallback({}, mockRes);
      
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.stringContaining('<h1>API Documentation</h1>')
      );
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.stringContaining('Swagger specification not found.')
      );
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.stringContaining('npm run build')
      );
    });

    it('should handle JSON parsing errors gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');

      expect(() => {
        setupSwaggerUi(mockApp);
      }).toThrow();
    });
  });
});
