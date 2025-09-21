import { Router, Request, Response } from 'express';
import { HealthGetController } from './HealthGetController';
import { asyncHandler } from '../../setup/middleware/errorHandler';
import { EnvVars } from '../../setup/EnvVars';
import { ContainerDAO } from '../../domain/interfaces/ContainerDAO';

/**
 * Registers health check route
 * 
 * @param router - Express router instance
 * @param envVars - Environment variables configuration
 * @param containerDAO - Container for all DAO instances
 */
export function registerHealthRoutes(
  router: Router,
  envVars: EnvVars,
  containerDAO: ContainerDAO<unknown>
): void {

  /**
   * GET /health
   * Health check endpoint to verify API status
   * No authentication required
   * Returns: 200 with system status
   */
  router.get(
    '/health', 
    asyncHandler(async (_req: Request, res: Response) => {
      res.json(await new HealthGetController(envVars, containerDAO).getHealth());
    })
  );
  
}
