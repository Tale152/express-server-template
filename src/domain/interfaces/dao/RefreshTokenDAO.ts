import { RefreshToken } from '../entities/RefreshToken';
import { DatabaseSession } from '../DatabaseSession';

/**
 * RefreshToken Data Access Object Interface
 * 
 * Provides database-agnostic operations for RefreshToken entity management.
 * Handles JWT refresh token lifecycle including creation, validation, revocation,
 * and cleanup while maintaining database technology independence.
 * 
 * Refresh tokens are long-lived credentials used to obtain new access tokens
 * without requiring user re-authentication. They are critical for security
 * and must be handled with special care including rotation and revocation.
 * 
 * @template S - Database session type (e.g., MongoDB ClientSession, PostgreSQL PoolClient)
 */
export interface RefreshTokenDAO<S> {
  /**
   * Create a new refresh token
   * 
   * Creates a new refresh token record for long-term authentication.
   * The token string must be unique across all refresh tokens.
   * Used during initial login and token rotation scenarios.
   * 
   * @param session - Database session for transaction support
   * @param userId - User ID associated with the token (must reference existing user)
   * @param token - JWT refresh token string (must be unique)
   * @param expiresAt - Token expiration date (typically 7-30 days from creation)
   * @param now - Current timestamp for createdAt field
   * @returns Promise<RefreshToken> - Created refresh token entity
   * 
   * @throws Error if database operation fails, user doesn't exist, or token is not unique
   * @transactional Requires active database session
   */
  createRefreshToken(
    session: DatabaseSession<S>,
    userId: string,
    token: string,
    expiresAt: Date,
    now: number
  ): Promise<RefreshToken>;

  /**
   * Find refresh token by token string
   * 
   * Retrieves a refresh token by its JWT string for validation purposes.
   * Used during token refresh operations to verify token validity before
   * issuing new access tokens.
   * 
   * @param token - JWT refresh token string to find
   * @returns Promise<RefreshToken | null> - Refresh token entity or null if not found
   * 
   * @throws Error if database operation fails
   * @readonly Does not require database session
   */
  findRefreshToken(token: string): Promise<RefreshToken | null>;

  /**
   * Revoke refresh token
   * 
   * Marks a refresh token as revoked, making it invalid for future use.
   * Revoked tokens cannot be used to obtain new access tokens regardless
   * of expiration time. Used during logout, token rotation, or security incidents.
   * 
   * @param session - Database session for transaction support
   * @param token - JWT refresh token string to revoke
   * @param now - Current timestamp for updatedAt field
   * @returns Promise<boolean> - true if token was found and revoked, false if token not found
   * 
   * @throws Error if database operation fails
   * @transactional Requires active database session
   */
  revokeRefreshToken(session: DatabaseSession<S>, token: string, now: number): Promise<boolean>;

  /**
   * Clean expired refresh tokens
   * 
   * Removes or marks as invalid refresh tokens that have passed their expiration date.
   * This is a maintenance operation that helps keep the token storage clean and
   * prevents accumulation of stale tokens. Should be run periodically via cron jobs
   * or scheduled tasks.
   * 
   * @param session - Database session for transaction support
   * @param expirationDate - Date threshold - tokens expiring before this date will be cleaned
   * @returns Promise<void> - Operation completes without return value
   * 
   * @throws Error if database operation fails
   * @transactional Requires active database session
   * @maintenance This is a cleanup operation for database maintenance
   */
  cleanExpiredRefreshTokens(session: DatabaseSession<S>, expirationDate: Date): Promise<void>;
}
