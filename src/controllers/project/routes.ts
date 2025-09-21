import { Router, Request, Response } from 'express';
import { ProjectCreatePostController } from './create/ProjectCreatePostController';
import { ProjectListGetController } from './list/ProjectListGetController';
import { ProjectGetController } from './get/ProjectGetController';
import { ProjectUpdatePutController } from './update/ProjectUpdatePutController';
import { ProjectDeleteController } from './delete/ProjectDeleteController';
import { asyncHandler, dbTransactionHandler } from '../../setup/middleware/errorHandler';
import { validateRequestBody, validateRequestParams } from '../../setup/middleware/classValidation';
import { authMiddleware } from '../../setup/middleware/authMiddleware';
import { EnvVars } from '../../setup/EnvVars';
import { ContainerDAO } from '../../domain/interfaces/ContainerDAO';
import { CreateProjectRequest } from '../../dto/project/create/CreateProjectRequest';
import { UpdateProjectRequest } from '../../dto/project/update/UpdateProjectRequest';
import { ProjectParams } from '../../dto/project/ProjectParams';
import { DatabaseSession } from '../../domain/interfaces/DatabaseSession';
import { DatabaseSessionProducer } from '../../domain/interfaces/DatabaseSessionProducer';
import { TimestampProducer } from '../../utils/TimestampProducer';

/**
 * Registers all project management routes
 * All routes require authentication
 * 
 * @param router - Express router instance
 * @param envVars - Environment variables configuration
 * @param containerDAO - Container for all DAO instances
 * @param databaseSessionProducer - Producer for database sessions
 * @param timestampProducer - Producer for timestamps
 */
export function registerProjectRoutes(
  router: Router,
  envVars: EnvVars,
  containerDAO: ContainerDAO<unknown>,
  databaseSessionProducer: DatabaseSessionProducer<unknown>,
  timestampProducer: TimestampProducer
): void {

  /**
   * POST /project
   * Create a new project for the authenticated user
   * Requires authentication
   * Requires: name (1-100 chars), gitUrl
   * Returns: 201 with created project data
   */
  router.post(
    '/project',
    authMiddleware(envVars),
    validateRequestBody(CreateProjectRequest),
    dbTransactionHandler(
      databaseSessionProducer, 
      async (session: DatabaseSession<unknown>, req: Request) => {
        const data = await new ProjectCreatePostController(
          envVars, containerDAO, session, timestampProducer
        ).createProject(req.body, req);
        return { statusCode: 201, data };
      }
    )
  );

  /**
   * GET /project/list
   * Get paginated list of user's projects
   * Requires authentication
   * Query params: page (default: 1), limit (default: 10)
   * Returns: 200 with projects array and pagination info
   */
  router.get(
    '/project/list',
    authMiddleware(envVars),
    asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      res.json(await new ProjectListGetController(envVars, containerDAO).getProjects(req, page, limit));
    })
  );

  /**
   * GET /project/:projectId
   * Get specific project by ID
   * Requires authentication and project ownership
   * Returns: 200 with project data
   */
  router.get(
    '/project/:projectId',
    authMiddleware(envVars),
    validateRequestParams(ProjectParams),
    asyncHandler(async (req: Request, res: Response) => {
      res.json(await new ProjectGetController(envVars, containerDAO).getProject(req.params.projectId, req));
    })
  );

  /**
   * PUT /project/:projectId
   * Update existing project
   * Requires authentication and project ownership
   * Requires: name (optional), gitUrl (optional)
   * Returns: 200 with updated project data
   */
  router.put(
    '/project/:projectId',
    authMiddleware(envVars),
    validateRequestParams(ProjectParams),
    validateRequestBody(UpdateProjectRequest),
    dbTransactionHandler(
      databaseSessionProducer, 
      async (session: DatabaseSession<unknown>, req: Request) => {
        const data = await new ProjectUpdatePutController(
          envVars, containerDAO, session, timestampProducer
        ).updateProject(
          req.params.projectId, req.body, req
        );
        return { statusCode: 200, data };
      }
    )
  );

  /**
   * DELETE /project/:projectId
   * Delete project by ID
   * Requires authentication and project ownership
   * Returns: 200 with deletion confirmation
   */
  router.delete(
    '/project/:projectId',
    authMiddleware(envVars),
    validateRequestParams(ProjectParams),
    dbTransactionHandler(
      databaseSessionProducer, 
      async (session: DatabaseSession<unknown>, req: Request) => {
        const data = await new ProjectDeleteController(envVars, containerDAO, session).deleteProject(
          req.params.projectId, req
        );
        return { statusCode: 200, data };
      }
    )
  );
}
