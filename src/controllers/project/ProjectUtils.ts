import { AppError } from '../../setup/middleware/errorHandler';
import { ContainerDAO } from '../../domain/interfaces/ContainerDAO';
import { Project } from '../../domain/interfaces/entities/Project';
import { ProjectResponse } from '../../dto/project/ProjectResponse';
import { JWTPayload } from '../../utils/JWTService';

/**
 * Utility functions for project operations
 */
export class ProjectUtils {
  /**
   * Finds a project by ID or throws a 404 error if not found
   * @param containerDAO - DAO container for database operations
   * @param projectId - ID of the project to find
   * @returns Promise<Project> - The found project
   * @throws AppError with 404 status if project not found
   */
  static async findProjectOr404(
    containerDAO: ContainerDAO<unknown>,
    projectId: string
  ): Promise<Project> {
    const project = await containerDAO.projectDAO.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  }

  /**
   * Checks if a project is owned by the authenticated user or throws a 403 error
   * @param project - The project to check ownership for
   * @param user - The authenticated user
   * @throws AppError with 403 status if user doesn't own the project
   */
  static isProjectOwnedByUserOr403(project: Project, user: JWTPayload): void {
    if (project.userId !== user.userId) {
      throw new AppError('Access denied', 403);
    }
  }

  /**
   * Combined utility that finds a project and verifies ownership in one call
   * @param containerDAO - DAO container for database operations
   * @param projectId - ID of the project to find
   * @param user - The authenticated user
   * @returns Promise<Project> - The found and verified project
   * @throws AppError with 404 status if project not found or 403 if access denied
   */
  static async findProjectAndVerifyOwnership(
    containerDAO: ContainerDAO<unknown>,
    projectId: string,
    user: JWTPayload
  ): Promise<Project> {
    const project = await this.findProjectOr404(containerDAO, projectId);
    this.isProjectOwnedByUserOr403(project, user);
    return project;
  }

  /**
   * Converts a Project entity to a ProjectResponse DTO
   * @param project - The project entity to convert
   * @returns ProjectResponse - The formatted response object
   */
  static toProjectResponse(project: Project): ProjectResponse {
    return {
      id: project.id,
      name: project.name,
      gitUrl: project.gitUrl,
      userId: project.userId,
      createdAt: project.createdAt!,
      updatedAt: project.updatedAt!
    };
  }
}