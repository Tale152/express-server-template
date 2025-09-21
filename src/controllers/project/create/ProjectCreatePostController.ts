import { Post, Body, Route, Tags, Request, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { TransactionAbstractController } from '../../CustomController';
import { CreateProjectRequest } from '../../../dto/project/create/CreateProjectRequest';
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
export class ProjectCreatePostController extends TransactionAbstractController {
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
   * Create a new project
   */
  @Post()
  @Security('Bearer')
  public async createProject(
    @Body() requestBody: CreateProjectRequest,
    @Request() req: ExpressRequest
  ): Promise<ProjectResponse> {
    const user = getAuthenticatedUser(req);
    const { name, gitUrl } = requestBody;

    const project = await this.containerDAO.projectDAO.createProject(
      this.session,
      name,
      gitUrl,
      user.userId,
      this.timestampProducer.getNow()
    );

    if (!project) {
      throw new AppError('A project with this name already exists', 409);
    }

    return ProjectUtils.toProjectResponse(project);
  }
}
