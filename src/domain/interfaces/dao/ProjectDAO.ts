import { Project } from '../entities/Project';
import { DatabaseSession } from '../DatabaseSession';

/**
 * Result interface for paginated project queries
 */
export interface GetAllProjectsResult {
  projects: Project[];
  total: number;
  totalPages: number;
}

/**
 * Project Data Access Object Interface
 * 
 * Provides database-agnostic operations for Project entity management.
 * Handles project CRUD operations, ownership validation, and pagination
 * while maintaining database technology independence.
 * 
 * All write operations require a database session for transactional consistency.
 * Read operations are session-free as they don't modify data.
 * 
 * @template S - Database session type (e.g., MongoDB ClientSession, PostgreSQL PoolClient)
 */
export interface ProjectDAO<S> {
  /**
   * Create a new project with unique name constraint per user
   * 
   * Creates a new project for a specific user with name uniqueness validation.
   * Each user can have only one project with the same name.
   * 
   * @param session - Database session for transaction support
   * @param name - Project name (must be unique per user, 1-100 characters)
   * @param gitUrl - Git repository URL (any valid Git URL format)
   * @param userId - Owner user ID (must reference existing user)
   * @param now - Current timestamp for createdAt/updatedAt fields
   * @returns Promise<Project | null> - Created project or null if name already exists for this user
   * 
   * @throws Error if database operation fails or user doesn't exist
   * @transactional Requires active database session
   */
  createProject(
    session: DatabaseSession<S>, 
    name: string, 
    gitUrl: string, 
    userId: string, 
    now: number
  ): Promise<Project | null>;

  /**
   * Find project by ID
   * 
   * Retrieves a project by its unique identifier.
   * No ownership validation - use isProjectOwnedByUser for access control.
   * 
   * @param projectId - Project's unique identifier
   * @returns Promise<Project | null> - Project entity or null if not found
   * 
   * @throws Error if database operation fails
   * @readonly Does not require database session
   */
  findById(projectId: string): Promise<Project | null>;

  /**
   * Find all projects for a specific user with pagination
   * 
   * Retrieves projects owned by a specific user with pagination support.
   * Results are typically ordered by creation date or name.
   * 
   * @param userId - User's unique identifier
   * @param page - Page number (1-based)
   * @param limit - Maximum projects per page
   * @returns Promise<GetAllProjectsResult> - Paginated projects with metadata
   * 
   * @throws Error if database operation fails
   * @readonly Does not require database session
   */
  findByUserId(userId: string, page: number, limit: number): Promise<GetAllProjectsResult>;

  /**
   * Update project by ID with unique name constraint per user
   * 
   * Updates project fields with ownership validation and name uniqueness check.
   * Only the project owner can update the project.
   * Name uniqueness is enforced per user if name is being changed.
   * 
   * @param session - Database session for transaction support
   * @param projectId - Project ID to update
   * @param userId - Owner user ID (for ownership verification)
   * @param now - Current timestamp for updatedAt field
   * @param name - New project name (optional, must be unique per user if provided)
   * @param gitUrl - New git URL (optional)
   * @returns Promise<Project | null> - Updated project, null if not found/no ownership or name conflict
   * 
   * @throws Error if database operation fails
   * @transactional Requires active database session
   */
  updateProject(
    session: DatabaseSession<S>,
    projectId: string,
    userId: string,
    now: number,
    name?: string,
    gitUrl?: string
  ): Promise<Project | null>;

  /**
   * Delete project by ID
   * 
   * Deletes a project with ownership validation.
   * Only the project owner can delete the project.
   * 
   * @param session - Database session for transaction support
   * @param projectId - Project ID to delete
   * @param userId - Owner user ID (for ownership verification)
   * @returns Promise<boolean> - true if deleted successfully, false if not found or no ownership
   * 
   * @throws Error if database operation fails
   * @transactional Requires active database session
   */
  deleteProject(session: DatabaseSession<S>, projectId: string, userId: string): Promise<boolean>;

  /**
   * Check if user owns the project
   * 
   * Validates whether a specific user is the owner of a project.
   * Used for access control before performing operations on projects.
   * 
   * @param projectId - Project's unique identifier
   * @param userId - User's unique identifier
   * @returns Promise<boolean> - true if user owns the project, false otherwise
   * 
   * @throws Error if database operation fails
   * @readonly Does not require database session
   */
  isProjectOwnedByUser(projectId: string, userId: string): Promise<boolean>;

}
