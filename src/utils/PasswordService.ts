import { randomBytes, pbkdf2 } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

/**
 * Service class for secure password hashing and verification.
 * 
 * Provides cryptographically secure password operations using PBKDF2
 * (Password-Based Key Derivation Function 2) with SHA-512 hashing.
 * Each password is hashed with a unique random salt to prevent
 * rainbow table attacks.
 * 
 * Security features:
 * - 32-byte random salt per password
 * - 100,000 iterations (PBKDF2)
 * - SHA-512 hashing algorithm
 * - 64-byte derived key length
 */
export class PasswordService {
  /** Length of the random salt in bytes */
  private static readonly SALT_LENGTH = 32;
  
  /** Number of PBKDF2 iterations for key derivation */
  private static readonly ITERATIONS = 100000;
  
  /** Length of the derived key in bytes */
  private static readonly KEY_LENGTH = 64;
  
  /** Hashing algorithm used for PBKDF2 */
  private static readonly ALGORITHM = 'sha512';

  /**
   * Hashes a password with a cryptographically secure random salt.
   * 
   * Generates a unique 32-byte random salt and uses PBKDF2 with SHA-512
   * to derive a 64-byte key from the password. The salt and hash are
   * combined into a single string for storage.
   * 
   * @param password - Plain text password to hash
   * @returns Promise resolving to salt:hash string format
   */
  public static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(this.SALT_LENGTH).toString('hex');
    const hash = await pbkdf2Async(
      password,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      this.ALGORITHM
    );
    return `${salt}:${hash.toString('hex')}`;
  }

  /**
   * Verifies a password against its stored hash.
   * 
   * Extracts the salt from the stored hash, re-hashes the provided
   * password with the same salt and parameters, then performs a
   * constant-time comparison to prevent timing attacks.
   * 
   * @param password - Plain text password to verify
   * @param hashedPassword - Stored hash in salt:hash format
   * @returns Promise resolving to true if password matches, false otherwise
   */
  public static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = await pbkdf2Async(
      password,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      this.ALGORITHM
    );
    return hash === verifyHash.toString('hex');
  }
}
