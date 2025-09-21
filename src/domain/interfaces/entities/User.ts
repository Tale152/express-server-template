/**
 * User Entity
 * 
 * Primary entity representing application users with authentication credentials.
 * Serves as the root entity that owns all other business entities in the system.
 */
export interface User {
  /**
   * Unique identifier for the user
   * 
   * Primary key that uniquely identifies each user in the system.
   * Used as foreign key reference in other entities.
   * 
   * @type {string}
   */
  id: string;

  /**
   * Unique username for authentication
   * 
   * Must be unique across all users. Used for login authentication.
   * Constraints: 3-50 characters, alphanumeric with underscores and hyphens only.
   * 
   * @type {string}
   * @unique
   */
  username: string;

  /**
   * Hashed password for security
   * 
   * Stores the bcrypt hashed password. Original password is never stored.
   * Must meet complexity requirements: 8+ characters with mixed case and numbers.
   * 
   * @type {string}
   * @security Stored as bcrypt hash, never in plain text
   */
  password: string;

  /**
   * Creation timestamp
   * 
   * Automatically set when the user account is created.
   * Managed by database layer.
   * 
   * @type {Date}
   * @optional
   */
  createdAt?: Date;

  /**
   * Last modification timestamp
   * 
   * Automatically updated whenever user data is modified.
   * Managed by database layer.
   * 
   * @type {Date}
   * @optional
   */
  updatedAt?: Date;
}
