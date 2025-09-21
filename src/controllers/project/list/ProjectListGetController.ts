import { Get, Route, Tags, Request, Query, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { BaseCustomController } from '../../CustomController';
import { ProjectListResponse } from '../../../dto/project/ProjectListResponse';
import { getAuthenticatedUser } from '../../../setup/middleware/authMiddleware';
import { EnvVars } from '../../../setup/EnvVars';
import { ContainerDAO } from '../../../domain/interfaces/ContainerDAO';

@Route('project')
@Tags('Project')
export class ProjectListGetController extends BaseCustomController {
  constructor(
    envVars: EnvVars,
    containerDAO: ContainerDAO<unknown>
  ) {
    super(envVars, containerDAO);
  }

  /**
   * Get user's projects with pagination
   */
  @Get('list')
  @Security('Bearer')
  public async getProjects(
    @Request() req: ExpressRequest,
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<ProjectListResponse> {
    const user = getAuthenticatedUser(req);
    
    // Validate pagination parameters
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const result = await this.containerDAO.projectDAO.findByUserId(
      user.userId, validPage, validLimit
    );

    return {
      projects: result.projects.map(project => ({
        id: project.id,
        name: project.name,
        gitUrl: project.gitUrl,
        userId: project.userId,
        createdAt: project.createdAt!,
        updatedAt: project.updatedAt!
      })),
      total: result.total,
      totalPages: result.totalPages,
      currentPage: validPage,
      limit: validLimit
    };
  }
}
