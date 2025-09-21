import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Request for refreshing access token
 */
export class RefreshTokenRequest {
  /**
   * The refresh token to use for generating a new access token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
    refreshToken!: string;
}
