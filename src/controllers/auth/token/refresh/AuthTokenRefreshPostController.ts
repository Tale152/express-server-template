import { Post, Body, Route, Tags } from 'tsoa';

import { AuthController } from '../../AuthController';
import { RefreshTokenRequest } from '../../../../dto/auth/token/refresh/RefreshTokenRequest';
import { RefreshTokenResponse } from '../../../../dto/auth/token/refresh/RefreshTokenResponse';
import { JWTPayload } from '../../../../utils/JWTService';
import { AppError } from '../../../../setup/middleware/errorHandler';
import { TokenDBUtils } from '../../../../domain/utils/TokenDBUtils';
import { EnvVars } from '../../../../setup/EnvVars';
import { ContainerDAO } from '../../../../domain/interfaces/ContainerDAO';
import { DatabaseSession } from '../../../../domain/interfaces/DatabaseSession';

@Route('auth')
@Tags('Authentication')
export class AuthTokenRefreshPostController extends AuthController {
  constructor(
    envVars: EnvVars,
    containerDAO: ContainerDAO<unknown>,
    databaseSession: DatabaseSession<unknown>,
    now: number
  ) {
    super(envVars, containerDAO, databaseSession, now);
  }

  /**
   * Refresh access token using refresh token
   */
  @Post('token/refresh')
  public async execute(
    @Body() requestBody: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const { refreshToken } = requestBody;

    let payload: JWTPayload;
    try {
      payload = this.jwtService.verifyRefreshToken(refreshToken);
    } catch (_error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const storedRefreshToken = await this.containerDAO.refreshTokenDAO.findRefreshToken(refreshToken);
    if (!storedRefreshToken || storedRefreshToken.isRevoked) {
      throw new AppError('Invalid or revoked refresh token', 401);
    }

    if (storedRefreshToken.expiresAt < new Date(this.now)) {
      throw new AppError('Refresh token has expired', 401);
    }

    const user = await this.containerDAO.userDAO.findById(payload.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create a clean payload without JWT system claims (exp, iat, etc.)
    const cleanPayload: JWTPayload = {
      userId: payload.userId,
      username: payload.username
    };

    const newTokenPair = this.jwtService.generateTokenPair(cleanPayload);

    await this.containerDAO.refreshTokenDAO.revokeRefreshToken(this.session, refreshToken, this.now);

    await TokenDBUtils.storeTokens(
      this.containerDAO,
      this.session,
      this.envVars,
      payload.userId,
      newTokenPair.accessToken,
      newTokenPair.refreshToken,
      this.now
    );

    return {
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken
    };
  }

}
