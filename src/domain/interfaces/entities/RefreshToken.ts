/**
 * RefreshToken Entity
 * 
 * Authentication entity representing JWT refresh tokens for token renewal.
 * Refresh tokens are long-lived credentials used to obtain new access tokens
 * when they expire, allowing for seamless session management without requiring
 * users to re-authenticate frequently.
 */
export interface RefreshToken {
  /**
   * Unique identifier for the refresh token
   * 
   * Primary key that uniquely identifies each refresh token in the system.
   * 
   * @type {string}
   */
  id: string;

  /**
   * Owner user identifier
   * 
   * Foreign key linking to the User who owns this refresh token.
   * Used to associate the token with its owner for token renewal operations.
   * 
   * @type {string}
   * @foreignKey References User.id
   */
  userId: string;

  /**
   * JWT refresh token string
   * 
   * The actual JWT refresh token used for obtaining new access tokens.
   * Must be unique across all refresh tokens to prevent conflicts.
   * Contains encoded user information and longer expiration data.
   * 
   * @type {string}
   * @unique
   * @security Contains sensitive authentication data
   */
  token: string;

  /**
   * Token expiration timestamp
   * 
   * Date and time when this refresh token expires and becomes invalid.
   * Refresh tokens are typically long-lived (e.g., 7-30 days) compared to access tokens.
   * 
   * @type {Date}
   */
  expiresAt: Date;

  /**
   * Token revocation flag
   * 
   * Indicates whether this token has been manually revoked before expiration.
   * Revoked tokens cannot be used to generate new access tokens.
   * Used for security purposes (logout, compromise, session termination, etc.).
   * 
   * @type {boolean}
   * @default false
   */
  isRevoked: boolean;

  /**
   * Creation timestamp
   * 
   * Automatically set when the refresh token is created.
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
