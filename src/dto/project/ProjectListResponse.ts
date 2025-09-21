import { ProjectResponse } from './ProjectResponse';

/**
 * Paginated list of projects response
 */
export interface ProjectListResponse {
  /**
   * List of projects
   */
  projects: ProjectResponse[];

  /**
   * Total number of projects
   * @example 42
   */
  total: number;

  /**
   * Total number of pages
   * @example 5
   */
  totalPages: number;

  /**
   * Current page number
   * @example 1
   */
  currentPage: number;

  /**
   * Number of items per page
   * @example 10
   */
  limit: number;
}
