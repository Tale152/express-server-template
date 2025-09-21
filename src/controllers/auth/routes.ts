import { Router, Request } from 'express';
import { AuthRegisterPostController } from './register/AuthRegisterPostController';
import { AuthLoginPostController } from './login/AuthLoginPostController';
import { AuthLogoutPostController } from './logout/AuthLogoutPostController';
import { AuthTokenRefreshPostController } from './token/refresh/AuthTokenRefreshPostController';
import { dbTransactionHandler } from '../../setup/middleware/errorHandler';
import { validateRequestBody } from '../../setup/middleware/classValidation';
import { EnvVars } from '../../setup/EnvVars';
import { ContainerDAO } from '../../domain/interfaces/ContainerDAO';
import { RegisterRequest } from '../../dto/auth/register/RegisterRequest';
import { LoginRequest } from '../../dto/auth/login/LoginRequest';
import { LogoutRequest } from '../../dto/auth/logout/LogoutRequest';
import { RefreshTokenRequest } from '../../dto/auth/token/refresh/RefreshTokenRequest';
import { DatabaseSession } from '../../domain/interfaces/DatabaseSession';
import { DatabaseSessionProducer } from '../../domain/interfaces/DatabaseSessionProducer';
import { TimestampProducer } from '../../utils/TimestampProducer';

/**
 * Registers all authentication-related routes
 * 
 * @param router - Express router instance
 * @param envVars - Environment variables configuration
 * @param containerDAO - Container for all DAO instances
 * @param databaseSessionProducer - Producer for database sessions
 * @param timestampProducer - Producer for timestamps
 */
export function registerAuthRoutes(
  router: Router,
  envVars: EnvVars,
  containerDAO: ContainerDAO<unknown>,
  databaseSessionProducer: DatabaseSessionProducer<unknown>,
  timestampProducer: TimestampProducer
): void {
    
  /**
   * POST /auth/register
   * Register a new user account
   * Requires: username (3-50 chars, alphanumeric), password (8+ chars with mixed case and numbers)
   * Returns: 201 with user data and tokens
   */
  router.post(
    '/auth/register',
    validateRequestBody(RegisterRequest),
    dbTransactionHandler(
      databaseSessionProducer, 
      async (session: DatabaseSession<unknown>, req: Request) => {
        const data = await new AuthRegisterPostController(
          envVars, containerDAO, session, timestampProducer.getNow()
        ).register(req.body);
        return { statusCode: 201, data };
      }
    )
  );

  /**
   * POST /auth/login
   * Authenticate user with credentials
   * Requires: username, password
   * Returns: 200 with user data and tokens
   */
  router.post(
    '/auth/login', 
    validateRequestBody(LoginRequest),
    dbTransactionHandler(
      databaseSessionProducer, 
      async (session: DatabaseSession<unknown>, req: Request) => {
        const data = await new AuthLoginPostController(
          envVars, containerDAO, session, timestampProducer.getNow()
        ).login(req.body);
        return { statusCode: 200, data };
      }
    )
  );

  /**
   * POST /auth/logout
   * Logout user by invalidating tokens
   * Requires: accessToken, refreshToken
   * Returns: 200 with logout confirmation
   */
  router.post(
    '/auth/logout', 
    validateRequestBody(LogoutRequest),
    dbTransactionHandler(
      databaseSessionProducer, 
      async (session: DatabaseSession<unknown>, req: Request) => {
        const data = await new AuthLogoutPostController(
          envVars, containerDAO, session, timestampProducer.getNow()
        ).logout(req.body);
        return { statusCode: 200, data };
      }
    )
  );

  /**
   * POST /auth/token/refresh
   * Refresh access token using refresh token
   * Requires: refreshToken
   * Returns: 200 with new access and refresh tokens
   */
  router.post(
    '/auth/token/refresh', 
    validateRequestBody(RefreshTokenRequest),
    dbTransactionHandler(
      databaseSessionProducer, 
      async (session: DatabaseSession<unknown>, req: Request) => {
        const data = await new AuthTokenRefreshPostController(
          envVars, containerDAO, session, timestampProducer.getNow()
        ).execute(req.body);
        return { statusCode: 200, data };
      }
    )
  );
}
