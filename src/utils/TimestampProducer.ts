/**
 * Interface for timestamp generation abstraction.
 * 
 * Provides a way to get current timestamp that can be easily mocked in tests.
 * This abstraction enables dependency injection of time functions, making
 * time-dependent code fully testable without relying on actual system time.
 */
export interface TimestampProducer {
  /**
   * Gets the current timestamp in milliseconds since Unix epoch.
   * 
   * @returns Current timestamp as number of milliseconds since January 1, 1970 UTC
   */
  getNow(): number;
}

/**
 * Default implementation of TimestampProducer.
 * 
 * Uses the native Date.now() function to get the current system timestamp.
 * This is the standard implementation used in production environments.
 */
export class DefaultTimestampProducer implements TimestampProducer {
  /**
   * Gets the current timestamp using Date.now().
   * 
   * @returns Current timestamp in milliseconds since Unix epoch
   */
  public getNow(): number {
    return Date.now();
  }
}
