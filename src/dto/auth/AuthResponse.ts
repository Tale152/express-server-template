/**
 * Authentication response containing tokens and user information
 */
export interface AuthResponse {
  /**
   * JWT access token for API authentication
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  accessToken: string;

  /**
   * JWT refresh token for token renewal
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken: string;

  /**
   * User information
   */
  user: {
    /**
     * User ID
     * @example "507f1f77bcf86cd799439011"
     */
    id: string;

    /**
     * Username
     * @example "john_doe"
     */
    username: string;
  };
}
