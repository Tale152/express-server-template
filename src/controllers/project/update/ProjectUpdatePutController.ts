import { Put, Body, Route, Tags, Request, Path, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { TransactionAbstractController } from '../../CustomController';
import { UpdateProjectRequest } from '../../../dto/project/update/UpdateProjectRequest';
import { ProjectResponse } from '../../../dto/project/ProjectResponse';
import { getAuthenticatedUser } from '../../../setup/middleware/authMiddleware';
import { AppError } from '../../../setup/middleware/errorHandler';
import { ProjectUtils } from '../ProjectUtils';
import { EnvVars } from '../../../setup/EnvVars';
import { ContainerDAO } from '../../../domain/interfaces/ContainerDAO';
import { DatabaseSession } from '../../../domain/interfaces/DatabaseSession';
import { TimestampProducer } from '../../../utils/TimestampProducer';

@Route('project')
@Tags('Project')
export class ProjectUpdatePutController extends TransactionAbstractController {
  private readonly timestampProducer: TimestampProducer;

  constructor(
    envVars: EnvVars,
    containerDAO: ContainerDAO<unknown>,
    session: DatabaseSession<unknown>,
    timestampProducer: TimestampProducer
  ) {
    super(envVars, containerDAO, session);
    this.timestampProducer = timestampProducer;
  }

  /**
   * Update project by ID
   */
  @Put('{projectId}')
  @Security('Bearer')
  public async updateProject(
    @Path() projectId: string,
    @Body() requestBody: UpdateProjectRequest,
    @Request() req: ExpressRequest
  ): Promise<ProjectResponse> {
    const user = getAuthenticatedUser(req);
    const { name, gitUrl } = requestBody;

    await ProjectUtils.findProjectAndVerifyOwnership(
      this.containerDAO, projectId, user
    );

    const updatedProject = await this.containerDAO.projectDAO.updateProject(
      this.session,
      projectId,
      user.userId,
      this.timestampProducer.getNow(),
      name,
      gitUrl
    );

    if (!updatedProject) {
      throw new AppError('A project with this name already exists', 409);
    }

    return ProjectUtils.toProjectResponse(updatedProject);
  }
}
