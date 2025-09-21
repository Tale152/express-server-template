/**
 * Project response data
 */
export interface ProjectResponse {
  /**
   * Project ID
   * @example "507f1f77bcf86cd799439011"
   */
  id: string;

  /**
   * Project name
   * @example "My Awesome Project"
   */
  name: string;

  /**
   * Git repository URL
   * @example "https://github.com/user/repo.git"
   */
  gitUrl: string;

  /**
   * User ID who owns the project
   * @example "507f1f77bcf86cd799439012"
   */
  userId: string;

  /**
   * Project creation date
   * @example "2023-09-16T10:30:00.000Z"
   */
  createdAt: Date;

  /**
   * Project last update date
   * @example "2023-09-16T15:45:00.000Z"
   */
  updatedAt: Date;
}
