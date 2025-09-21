import { Get, Route, Tags, Request, Path, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { BaseCustomController } from '../../CustomController';
import { ProjectResponse } from '../../../dto/project/ProjectResponse';
import { getAuthenticatedUser } from '../../../setup/middleware/authMiddleware';
import { ProjectUtils } from '../ProjectUtils';
import { EnvVars } from '../../../setup/EnvVars';
import { ContainerDAO } from '../../../domain/interfaces/ContainerDAO';

@Route('project')
@Tags('Project')
export class ProjectGetController extends BaseCustomController {
  constructor(
    envVars: EnvVars,
    containerDAO: ContainerDAO<unknown>
  ) {
    super(envVars, containerDAO);
  }

  /**
   * Get project details by ID
   */
  @Get('{projectId}')
  @Security('Bearer')
  public async getProject(
    @Path() projectId: string,
    @Request() req: ExpressRequest
  ): Promise<ProjectResponse> {
    const user = getAuthenticatedUser(req);

    const project = await ProjectUtils.findProjectAndVerifyOwnership(
      this.containerDAO, projectId, user
    );

    return ProjectUtils.toProjectResponse(project);
  }
}
