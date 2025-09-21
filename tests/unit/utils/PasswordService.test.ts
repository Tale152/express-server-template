import { PasswordService } from '../../../src/utils/PasswordService';

describe('PasswordService', () => {
  const testPassword = 'MySecurePassword123!';
  const anotherPassword = 'AnotherPassword456#';

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const hashedPassword = await PasswordService.hashPassword(testPassword);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword).toContain(':'); // Salt and hash are separated by ':'
    });

    it('should generate different hashes for the same password', async () => {
      const hash1 = await PasswordService.hashPassword(testPassword);
      const hash2 = await PasswordService.hashPassword(testPassword);

      expect(hash1).not.toBe(hash2); // Different salt should produce different hash
    });

    it('should generate different hashes for different passwords', async () => {
      const hash1 = await PasswordService.hashPassword(testPassword);
      const hash2 = await PasswordService.hashPassword(anotherPassword);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const emptyPasswordHash = await PasswordService.hashPassword('');

      expect(emptyPasswordHash).toBeDefined();
      expect(typeof emptyPasswordHash).toBe('string');
      expect(emptyPasswordHash).toContain(':');
    });

    it('should handle special characters in password', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hashedPassword = await PasswordService.hashPassword(specialPassword);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).toContain(':');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const hashedPassword = await PasswordService.hashPassword(testPassword);
      const isValid = await PasswordService.verifyPassword(testPassword, hashedPassword);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hashedPassword = await PasswordService.hashPassword(testPassword);
      const isValid = await PasswordService.verifyPassword(anotherPassword, hashedPassword);

      expect(isValid).toBe(false);
    });

    it('should reject empty password against valid hash', async () => {
      const hashedPassword = await PasswordService.hashPassword(testPassword);
      const isValid = await PasswordService.verifyPassword('', hashedPassword);

      expect(isValid).toBe(false);
    });

    it('should verify empty password against empty password hash', async () => {
      const hashedEmptyPassword = await PasswordService.hashPassword('');
      const isValid = await PasswordService.verifyPassword('', hashedEmptyPassword);

      expect(isValid).toBe(true);
    });

    it('should handle invalid hash format', async () => {
      const invalidHash = 'invalid-hash-without-separator';
      
      // This should not throw but return false or handle gracefully
      await expect(PasswordService.verifyPassword(testPassword, invalidHash))
        .resolves.toBe(false);
    });

    it('should handle malformed hash with correct separator but invalid content', async () => {
      const malformedHash = 'invalid:hash';
      
      await expect(PasswordService.verifyPassword(testPassword, malformedHash))
        .resolves.toBe(false);
    });

    it('should be case sensitive', async () => {
      const hashedPassword = await PasswordService.hashPassword(testPassword);
      const isValidLower = await PasswordService.verifyPassword(testPassword.toLowerCase(), hashedPassword);
      const isValidUpper = await PasswordService.verifyPassword(testPassword.toUpperCase(), hashedPassword);

      expect(isValidLower).toBe(false);
      expect(isValidUpper).toBe(false);
    });
  });

  describe('security properties', () => {
    it('should generate sufficiently long hashes', async () => {
      const hashedPassword = await PasswordService.hashPassword(testPassword);
      
      // Hash should be reasonably long (salt + hash + separator)
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should use consistent salt length', async () => {
      const hash1 = await PasswordService.hashPassword(testPassword);
      const hash2 = await PasswordService.hashPassword(anotherPassword);

      const salt1 = hash1.split(':')[0];
      const salt2 = hash2.split(':')[0];

      expect(salt1.length).toBe(salt2.length);
      expect(salt1.length).toBeGreaterThan(0);
    });

    it('should generate hex-encoded output', async () => {
      const hashedPassword = await PasswordService.hashPassword(testPassword);
      const [salt, hash] = hashedPassword.split(':');

      // Should only contain hex characters (0-9, a-f)
      expect(salt).toMatch(/^[0-9a-f]+$/);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('complete password workflow', () => {
    it('should work end-to-end for multiple passwords', async () => {
      const passwords = [
        'SimplePassword',
        'Complex123!@#',
        'unicode🔐password',
        '',
        ' ', // space
        'a'.repeat(1000) // very long password
      ];

      for (const password of passwords) {
        const hashedPassword = await PasswordService.hashPassword(password);
        const isValid = await PasswordService.verifyPassword(password, hashedPassword);
        const isInvalid = await PasswordService.verifyPassword(password + 'x', hashedPassword);

        expect(isValid).toBe(true);
        expect(isInvalid).toBe(false);
      }
    });
  });
});
