/**
 * Response for successful logout
 */
export interface LogoutResponse {
  /**
   * Success message
   * @example "Logout successful"
   */
  message: string;

  /**
   * Timestamp when logout was performed
   * @example "2025-09-18T11:30:00.000Z"
   */
  loggedOutAt: Date;
}
