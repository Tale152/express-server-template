import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Request for user logout
 */
export class LogoutRequest {
  /**
   * JWT access token to invalidate
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @IsNotEmpty({ message: 'Access token is required' })
  @IsString({ message: 'Access token must be a string' })
    accessToken!: string;

  /**
   * JWT refresh token to invalidate
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
    refreshToken!: string;
}
