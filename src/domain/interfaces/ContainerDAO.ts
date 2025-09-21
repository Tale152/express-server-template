import { UserDAO } from './dao/UserDAO';
import { AccessTokenDAO } from './dao/AccessTokenDAO';
import { RefreshTokenDAO } from './dao/RefreshTokenDAO';
import { ProjectDAO } from './dao/ProjectDAO';

/**
 * Container interface that provides access to all DAO instances
 * 
 * This interface abstracts the creation and management of DAO instances,
 * allowing the application to remain database technology agnostic.
 * Implementations can provide MongoDB, PostgreSQL, MySQL, or any other
 * database-specific DAO instances while maintaining the same interface contract.
 * 
 * The generic type S represents the database session type used by the specific
 * database implementation (e.g., MongoDB ClientSession, PostgreSQL PoolClient).
 * 
 * @template S - Database session type specific to the implementation
 */
export interface ContainerDAO<S> {
  /**
   * Get UserDAO instance for user management operations
   */
  readonly userDAO: UserDAO<S>;

  /**
   * Get AccessTokenDAO instance for access token management operations
   */
  readonly accessTokenDAO: AccessTokenDAO<S>;

  /**
   * Get RefreshTokenDAO instance for refresh token management operations
   */
  readonly refreshTokenDAO: RefreshTokenDAO<S>;

  /**
   * Get ProjectDAO instance for project management operations
   */
  readonly projectDAO: ProjectDAO<S>;
}
