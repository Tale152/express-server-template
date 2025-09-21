/**
 * Project Entity
 * 
 * Business entity representing user projects with Git repositories.
 * Each project belongs to exactly one user and contains project metadata
 * including name and Git repository information.
 */
export interface Project {
  /**
   * Unique identifier for the project
   * 
   * Primary key that uniquely identifies each project in the system.
   * 
   * @type {string}
   */
  id: string;

  /**
   * Project display name
   * 
   * Human-readable name for the project.
   * Must be unique per user (same user cannot have multiple projects with same name).
   * Constraints: 1-100 characters.
   * 
   * @type {string}
   * @constraints 1-100 characters, unique per user
   */
  name: string;

  /**
   * Git repository URL
   * 
   * URL pointing to the Git repository associated with this project.
   * Can be any valid Git URL (GitHub, GitLab, Bitbucket, self-hosted, etc.).
   * 
   * @type {string}
   */
  gitUrl: string;

  /**
   * Owner user identifier
   * 
   * Foreign key linking to the User who owns this project.
   * Used for ownership validation and access control.
   * 
   * @type {string}
   * @foreignKey References User.id
   */
  userId: string;

  /**
   * Creation timestamp
   * 
   * Automatically set when the project is created.
   * Managed by database layer.
   * 
   * @type {Date}
   * @optional
   */
  createdAt?: Date;

  /**
   * Last modification timestamp
   * 
   * Automatically updated whenever project data is modified.
   * Managed by database layer.
   * 
   * @type {Date}
   * @optional
   */
  updatedAt?: Date;
}
