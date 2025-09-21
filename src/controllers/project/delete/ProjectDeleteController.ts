import { Delete, Route, Tags, Request, Path, Security } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { TransactionAbstractController } from '../../CustomController';
import { getAuthenticatedUser } from '../../../setup/middleware/authMiddleware';
import { AppError } from '../../../setup/middleware/errorHandler';
import { ProjectUtils } from '../ProjectUtils';
import { EnvVars } from '../../../setup/EnvVars';
import { ContainerDAO } from '../../../domain/interfaces/ContainerDAO';
import { DatabaseSession } from '../../../domain/interfaces/DatabaseSession';

@Route('project')
@Tags('Project')
export class ProjectDeleteController extends TransactionAbstractController {
  constructor(
    envVars: EnvVars, containerDAO: ContainerDAO<unknown>, session: DatabaseSession<unknown>
  ) {
    super(envVars, containerDAO, session);
  }

  /**
   * Delete project by ID
   */
  @Delete('{projectId}')
  @Security('Bearer')
  public async deleteProject(
    @Path() projectId: string,
    @Request() req: ExpressRequest
  ): Promise<{ message: string }> {
    const user = getAuthenticatedUser(req);

    await ProjectUtils.findProjectAndVerifyOwnership(
      this.containerDAO, projectId, user
    );

    // Delete the project
    const deleted = await this.containerDAO.projectDAO.deleteProject(
      this.session, projectId, user.userId
    );

    if (!deleted) {
      throw new AppError('Resource conflict - please try again', 423);
    }

    return {
      message: 'Project deleted successfully'
    };
  }
}
