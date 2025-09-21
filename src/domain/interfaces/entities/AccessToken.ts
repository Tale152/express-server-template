/**
 * AccessToken Entity
 * 
 * Authentication entity representing JWT access tokens for API authentication.
 * Access tokens are short-lived credentials used to authenticate API requests.
 * They can be revoked independently of their expiration time for security purposes.
 */
export interface AccessToken {
  /**
   * Unique identifier for the access token
   * 
   * Primary key that uniquely identifies each access token in the system.
   * 
   * @type {string}
   */
  id: string;

  /**
   * Owner user identifier
   * 
   * Foreign key linking to the User who owns this access token.
   * Used to associate the token with its owner for authentication purposes.
   * 
   * @type {string}
   * @foreignKey References User.id
   */
  userId: string;

  /**
   * JWT access token string
   * 
   * The actual JWT token used for API authentication.
   * Must be unique across all access tokens to prevent conflicts.
   * Contains encoded user information and expiration data.
   * 
   * @type {string}
   * @unique
   * @security Contains sensitive authentication data
   */
  token: string;

  /**
   * Token expiration timestamp
   * 
   * Date and time when this access token expires and becomes invalid.
   * Tokens are typically short-lived (e.g., 15-60 minutes).
   * 
   * @type {Date}
   */
  expiresAt: Date;

  /**
   * Token revocation flag
   * 
   * Indicates whether this token has been manually revoked before expiration.
   * Revoked tokens are considered invalid regardless of expiration time.
   * Used for security purposes (logout, compromise, etc.).
   * 
   * @type {boolean}
   * @default false
   */
  isRevoked: boolean;

  /**
   * Creation timestamp
   * 
   * Automatically set when the access token is created.
   * Managed by database layer.
   * 
   * @type {Date}
   * @optional
   */
  createdAt?: Date;

  /**
   * Last modification timestamp
   * 
   * Automatically updated whenever token data is modified (e.g., revocation).
   * Managed by database layer.
   * 
   * @type {Date}
   * @optional
   */
  updatedAt?: Date;
}
