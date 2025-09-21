import { User } from '../entities/User';
import { DatabaseSession } from '../DatabaseSession';

/**
 * User Data Access Object Interface
 * 
 * Provides database-agnostic operations for User entity management.
 * Handles user authentication, profile management, and user lookup operations
 * while maintaining database technology independence.
 * 
 * All write operations require a database session for transactional consistency.
 * Read operations are session-free as they don't modify data.
 * 
 * @template S - Database session type (e.g., MongoDB ClientSession, PostgreSQL PoolClient)
 */
export interface UserDAO<S> {
  /**
   * Create a new user with unique username constraint
   * 
   * Creates a new user account with the provided credentials.
   * Enforces username uniqueness constraint - returns null if username already exists.
   * Password should be pre-hashed before calling this method.
   * 
   * @param session - Database session for transaction support
   * @param username - Username (must be unique, 3-50 chars, alphanumeric + underscore/hyphen)
   * @param password - Pre-hashed password (bcrypt recommended)
   * @returns Promise<User | null> - Created user entity or null if username already exists
   * 
   * @throws Error if database operation fails
   * @transactional Requires active database session
   */
  createUser(session: DatabaseSession<S>, username: string, password: string): Promise<User | null>;

  /**
   * Find user by ID
   * 
   * Retrieves user by their unique identifier.
   * Returns user data without password for security.
   * 
   * @param userId - User's unique identifier
   * @returns Promise<User | null> - User entity or null if not found
   * 
   * @throws Error if database operation fails
   * @readonly Does not require database session
   */
  findById(userId: string): Promise<User | null>;

  /**
   * Find user by username
   * 
   * Retrieves user by their username for public operations.
   * Returns user data without password for security.
   * 
   * @param username - User's username
   * @returns Promise<User | null> - User entity or null if not found
   * 
   * @throws Error if database operation fails
   * @readonly Does not require database session
   * @security Password field is excluded from result
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find user by username including password (for authentication)
   * 
   * Retrieves user with password field for authentication purposes.
   * Should only be used during login/authentication flows.
   * 
   * @param username - User's username
   * @returns Promise<User | null> - User entity with password or null if not found
   * 
   * @throws Error if database operation fails
   * @readonly Does not require database session
   * @security Returns password field - use only for authentication
   */
  findByUsernameWithPassword(username: string): Promise<User | null>;
}
