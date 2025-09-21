/**
 * Response for health check endpoint
 */
export interface GetHealthResponse {
  /**
   * Health status of the application
   * @example "ok"
   */
  status: string;
}
