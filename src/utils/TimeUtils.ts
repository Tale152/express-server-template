import { AppError } from '../setup/middleware/errorHandler';

/**
 * Utility class for time-related operations.
 * 
 * Provides functions for parsing human-readable time strings into
 * milliseconds, supporting common time units used in configuration
 * files and environment variables.
 * 
 * Supported time units:
 * - 's' for seconds
 * - 'm' for minutes  
 * - 'h' for hours
 * - 'd' for days
 */
export class TimeUtils {
  /**
   * Parses a time string into milliseconds.
   * 
   * Converts human-readable time strings (like "15m", "7d", "30s", "2h")
   * into their equivalent millisecond values. Useful for parsing JWT
   * expiration times, session timeouts, and other duration configurations.
   * 
   * @param timeString - Time string with format: number + unit (e.g., "15m", "7d")
   * @returns Number of milliseconds equivalent to the time string
   * @throws {AppError} When time unit is not supported (400 status code)
   */
  public static parseExpiry(timeString: string): number {
    const timeValue = parseInt(timeString.slice(0, -1));
    const timeUnit = timeString.slice(-1);

    switch (timeUnit) {
    case 's':
      return timeValue * 1000;
    case 'm':
      return timeValue * 60000;
    case 'h':
      return timeValue * 3600000;
    case 'd':
      return timeValue * 86400000;
    default:
      throw new AppError(`Unsupported time unit: ${timeUnit}`, 400);
    }
  }
}
