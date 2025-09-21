import { TimestampProducer } from '../../src/utils/TimestampProducer';

/**
 * Mock implementation of TimestampProducer for testing
 * Allows controlling the timestamp returned by getNow()
 */
export class MockTimestampProducer implements TimestampProducer {
  private timestamp: number;

  /**
   * Create a mock timestamp producer with a fixed timestamp
   * @param fixedTimestamp - The timestamp to return from getNow()
   */
  constructor(fixedTimestamp: number = 1640995200000) { // Default: 2022-01-01 00:00:00 UTC
    this.timestamp = fixedTimestamp;
  }

  /**
   * Get the configured timestamp
   * @returns The fixed timestamp set in constructor or via setTimestamp
   */
  public getNow(): number {
    return this.timestamp;
  }

  /**
   * Set a new timestamp for subsequent calls to getNow()
   * @param timestamp - The new timestamp to return
   */
  public setTimestamp(timestamp: number): void {
    this.timestamp = timestamp;
  }

  /**
   * Advance the timestamp by the specified number of milliseconds
   * @param ms - Milliseconds to add to current timestamp
   */
  public advanceBy(ms: number): void {
    this.timestamp += ms;
  }

  /**
   * Reset timestamp to a specific date
   * @param date - Date to set as timestamp
   */
  public setDate(date: Date): void {
    this.timestamp = date.getTime();
  }
}
