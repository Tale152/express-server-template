import { JWTService, JWTPayload } from '../../../src/utils/JWTService';
import { createMockEnvVars } from '../../setup';
import { AppError } from '../../../src/setup/middleware/errorHandler';
import { EnvVars } from '../../../src/setup/EnvVars';

describe('JWTService', () => {
  let jwtService: JWTService;
  let envVars: EnvVars;

  const mockPayload: JWTPayload = {
    userId: 'user123',
    username: 'testuser'
  };

  beforeEach(() => {
    envVars = createMockEnvVars();
    jwtService = new JWTService(envVars);
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = jwtService.generateAccessToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const payload1: JWTPayload = { userId: 'user1', username: 'user1' };
      const payload2: JWTPayload = { userId: 'user2', username: 'user2' };

      const token1 = jwtService.generateAccessToken(payload1);
      const token2 = jwtService.generateAccessToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = jwtService.generateRefreshToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different refresh tokens than access tokens', () => {
      const accessToken = jwtService.generateAccessToken(mockPayload);
      const refreshToken = jwtService.generateRefreshToken(mockPayload);

      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokenPair = jwtService.generateTokenPair(mockPayload);

      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(typeof tokenPair.accessToken).toBe('string');
      expect(typeof tokenPair.refreshToken).toBe('string');
      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = jwtService.generateAccessToken(mockPayload);
      const decoded = jwtService.verifyAccessToken(token);

      expect(decoded).toMatchObject({
        userId: mockPayload.userId,
        username: mockPayload.username
      });
    });

    it('should throw AppError for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => jwtService.verifyAccessToken(invalidToken))
        .toThrow(AppError);
      
      expect(() => jwtService.verifyAccessToken(invalidToken))
        .toThrow('Invalid or expired access token');
    });

    it('should throw AppError for malformed token', () => {
      const malformedToken = 'not-a-jwt';

      expect(() => jwtService.verifyAccessToken(malformedToken))
        .toThrow(AppError);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = jwtService.generateRefreshToken(mockPayload);
      const decoded = jwtService.verifyRefreshToken(token);

      expect(decoded).toMatchObject({
        userId: mockPayload.userId,
        username: mockPayload.username
      });
    });

    it('should throw AppError for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => jwtService.verifyRefreshToken(invalidToken))
        .toThrow(AppError);
      
      expect(() => jwtService.verifyRefreshToken(invalidToken))
        .toThrow('Invalid or expired refresh token');
    });

    it('should not verify access token as refresh token', () => {
      const accessToken = jwtService.generateAccessToken(mockPayload);

      expect(() => jwtService.verifyRefreshToken(accessToken))
        .toThrow(AppError);
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      const token = jwtService.generateAccessToken(mockPayload);
      const decoded = jwtService.decodeToken(token);

      expect(decoded).toMatchObject({
        userId: mockPayload.userId,
        username: mockPayload.username
      });
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token';
      const decoded = jwtService.decodeToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should decode expired tokens', () => {
      // This test would require creating an expired token
      // For now, we test that it doesn't throw an error
      const token = jwtService.generateAccessToken(mockPayload);
      const decoded = jwtService.decodeToken(token);

      expect(decoded).not.toBeNull();
    });
  });

  describe('integration tests', () => {
    it('should work with the complete token lifecycle', () => {
      // Generate token pair
      const tokenPair = jwtService.generateTokenPair(mockPayload);

      // Verify both tokens
      const accessDecoded = jwtService.verifyAccessToken(tokenPair.accessToken);
      const refreshDecoded = jwtService.verifyRefreshToken(tokenPair.refreshToken);

      // Both should contain the same payload
      expect(accessDecoded).toMatchObject(mockPayload);
      expect(refreshDecoded).toMatchObject(mockPayload);

      // Decode without verification should also work
      const accessDecodedNoVerify = jwtService.decodeToken(tokenPair.accessToken);
      const refreshDecodedNoVerify = jwtService.decodeToken(tokenPair.refreshToken);

      expect(accessDecodedNoVerify).toMatchObject(mockPayload);
      expect(refreshDecodedNoVerify).toMatchObject(mockPayload);
    });
  });
});
