import { ContainerDAO } from '../interfaces/ContainerDAO';
import { DatabaseSession } from '../interfaces/DatabaseSession';
import { EnvVars } from '../../setup/EnvVars';
import { TimeUtils } from '../../utils/TimeUtils';

/**
 * Utility class for database operations related to tokens
 */
export class TokenDBUtils {
  /**
   * Stores both access and refresh tokens in the database
   * @param containerDAO The database container DAO
   * @param session The database session/transaction
   * @param envVars Environment variables containing token expiry settings
   * @param userId The user ID for whom to create the tokens
   * @param accessToken The access token string
   * @param refreshToken The refresh token string
   * @param now Current timestamp for expiry calculation
   */
  public static async storeTokens(
    containerDAO: ContainerDAO<unknown>,
    session: DatabaseSession<unknown>,
    envVars: EnvVars,
    userId: string,
    accessToken: string,
    refreshToken: string,
    now: number
  ): Promise<void> {
    const accessTokenExpiresAt = new Date(now + TimeUtils.parseExpiry(envVars.JWT_EXPIRES_IN));
    const refreshTokenExpiresAt = new Date(now + TimeUtils.parseExpiry(envVars.JWT_REFRESH_EXPIRES_IN));

    // Execute sequentially to avoid transaction conflicts
    await containerDAO.accessTokenDAO.createAccessToken(
      session,
      userId,
      accessToken,
      accessTokenExpiresAt,
      now
    );
    
    await containerDAO.refreshTokenDAO.createRefreshToken(
      session,
      userId,
      refreshToken,
      refreshTokenExpiresAt,
      now
    );
  }
}
