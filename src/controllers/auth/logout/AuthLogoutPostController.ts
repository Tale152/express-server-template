import { Post, Body, Route, Tags } from 'tsoa';

import { AuthController } from '../AuthController';
import { LogoutRequest } from '../../../dto/auth/logout/LogoutRequest';
import { LogoutResponse } from '../../../dto/auth/logout/LogoutResponse';
import { AppError } from '../../../setup/middleware/errorHandler';
import { EnvVars } from '../../../setup/EnvVars';
import { ContainerDAO } from '../../../domain/interfaces/ContainerDAO';
import { DatabaseSession } from '../../../domain/interfaces/DatabaseSession';

@Route('auth')
@Tags('Authentication')
export class AuthLogoutPostController extends AuthController {
  constructor(
    envVars: EnvVars,
    containerDAO: ContainerDAO<unknown>,
    session: DatabaseSession<unknown>,
    now: number
  ) {
    super(envVars, containerDAO, session, now);
  }

  /**
   * Logout user by invalidating both access and refresh tokens
   * @param requestBody - Logout request containing both tokens
   * @returns Promise<LogoutResponse> - Logout confirmation
   */
  @Post('logout')
  public async logout(@Body() requestBody: LogoutRequest): Promise<LogoutResponse> {
    const { accessToken, refreshToken } = requestBody;

    const accessTokenPayload = this.jwtService.verifyAccessToken(accessToken);
    const refreshTokenPayload = this.jwtService.verifyRefreshToken(refreshToken);
    if(accessTokenPayload.userId !== refreshTokenPayload.userId) {
      throw new AppError('Invalid tokens', 401);
    }

    await this.revokeTokenIfValid(
      accessToken,
      accessTokenPayload.userId,
      () => this.containerDAO.accessTokenDAO.findAccessToken(accessToken),
      (token) => this.containerDAO.accessTokenDAO.revokeAccessToken(this.session, token, this.now)
    );

    await this.revokeTokenIfValid(
      refreshToken,
      accessTokenPayload.userId,
      () => this.containerDAO.refreshTokenDAO.findRefreshToken(refreshToken),
      (token) => this.containerDAO.refreshTokenDAO.revokeRefreshToken(this.session, token, this.now)
    );

    return {
      message: 'Logout successful',
      loggedOutAt: new Date(this.now)
    };
  }

  /**
   * Generic method to revoke a token if it exists and is valid
   * @param token - The token string
   * @param expectedUserId - Expected user ID for validation
   * @param findToken - Function to find the token in database
   * @param revokeToken - Function to revoke the token
   */
  private async revokeTokenIfValid<T extends { userId: string; isRevoked: boolean }>(
    token: string,
    expectedUserId: string,
    findToken: () => Promise<T | null>,
    revokeToken: (token: string) => Promise<boolean>
  ): Promise<void> {
    const storedToken = await findToken();
    if (storedToken) {
      if (storedToken.userId !== expectedUserId) {
        throw new AppError('Token mismatch - tokens belong to different user', 401);
      } else if (!storedToken.isRevoked) {
        const revoked = await revokeToken(token);
        if (!revoked) {
          throw new AppError('Failed to revoke tokens', 500);
        }
      }
    }
  }
}
