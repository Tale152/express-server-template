import { AccessToken } from '../entities/AccessToken';
import { DatabaseSession } from '../DatabaseSession';

/**
 * AccessToken Data Access Object Interface
 * 
 * Provides database-agnostic operations for AccessToken entity management.
 * Handles JWT access token lifecycle including creation, validation, and revocation
 * while maintaining database technology independence.
 * 
 * Access tokens are short-lived credentials used for API authentication.
 * All write operations require a database session for transactional consistency.
 * 
 * @template S - Database session type (e.g., MongoDB ClientSession, PostgreSQL PoolClient)
 */
export interface AccessTokenDAO<S> {
  /**
   * Create a new access token
   * 
   * Creates a new access token record for user authentication.
   * The token string must be unique across all access tokens.
   * 
   * @param session - Database session for transaction support
   * @param userId - User ID associated with the token (must reference existing user)
   * @param token - JWT access token string (must be unique)
   * @param expiresAt - Token expiration date (typically 15-60 minutes from creation)
   * @param now - Current timestamp for createdAt field
   * @returns Promise<AccessToken> - Created access token entity
   * 
   * @throws Error if database operation fails, user doesn't exist, or token is not unique
   * @transactional Requires active database session
   */
  createAccessToken(
    session: DatabaseSession<S>,
    userId: string,
    token: string,
    expiresAt: Date,
    now: number
  ): Promise<AccessToken>;

  /**
   * Find access token by token string
   * 
   * Retrieves an access token by its JWT string for validation purposes.
   * Used during API authentication to verify token validity.
   * 
   * @param token - JWT access token string to find
   * @returns Promise<AccessToken | null> - Access token entity or null if not found
   * 
   * @throws Error if database operation fails
   * @readonly Does not require database session
   */
  findAccessToken(token: string): Promise<AccessToken | null>;

  /**
   * Revoke access token
   * 
   * Marks an access token as revoked, making it invalid for future use.
   * Revoked tokens cannot be used for authentication regardless of expiration time.
   * Used during logout, security breaches, or manual token invalidation.
   * 
   * @param session - Database session for transaction support
   * @param token - JWT access token string to revoke
   * @param now - Current timestamp for updatedAt field
   * @returns Promise<boolean> - true if token was found and revoked, false if token not found
   * 
   * @throws Error if database operation fails
   * @transactional Requires active database session
   */
  revokeAccessToken(session: DatabaseSession<S>, token: string, now: number): Promise<boolean>;
}
