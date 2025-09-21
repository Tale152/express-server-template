import { DefaultTimestampProducer, TimestampProducer } from '../../../src/utils/TimestampProducer';
import { MockTimestampProducer } from '../../mocks/MockTimestampProducer';

describe('TimestampProducer', () => {
  describe('DefaultTimestampProducer', () => {
    let timestampProducer: DefaultTimestampProducer;

    beforeEach(() => {
      timestampProducer = new DefaultTimestampProducer();
    });

    it('should implement TimestampProducer interface', () => {
      expect(timestampProducer).toBeInstanceOf(DefaultTimestampProducer);
      expect(timestampProducer.getNow).toBeDefined();
      expect(typeof timestampProducer.getNow).toBe('function');
    });

    it('should return current timestamp', () => {
      const before = Date.now();
      const result = timestampProducer.getNow();
      const after = Date.now();

      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
      expect(typeof result).toBe('number');
    });

    it('should return different timestamps on subsequent calls', () => {
      const first = timestampProducer.getNow();
      
      // Small delay to ensure different timestamps
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      return delay(1).then(() => {
        const second = timestampProducer.getNow();
        expect(second).toBeGreaterThanOrEqual(first);
      });
    });

    it('should return valid Date when converted', () => {
      const timestamp = timestampProducer.getNow();
      const date = new Date(timestamp);
      
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
      expect(date.getTime()).toBe(timestamp);
    });
  });

  describe('MockTimestampProducer', () => {
    const FIXED_TIMESTAMP = 1640995200000; // 2022-01-01 00:00:00 UTC

    it('should return fixed timestamp', () => {
      const mockProducer = new MockTimestampProducer(FIXED_TIMESTAMP);
      
      expect(mockProducer.getNow()).toBe(FIXED_TIMESTAMP);
      expect(mockProducer.getNow()).toBe(FIXED_TIMESTAMP); // Should be same on subsequent calls
    });

    it('should use default timestamp when none provided', () => {
      const mockProducer = new MockTimestampProducer();
      const result = mockProducer.getNow();
      
      expect(typeof result).toBe('number');
      expect(result).toBe(1640995200000); // Default timestamp
    });

    it('should allow changing timestamp via setTimestamp', () => {
      const mockProducer = new MockTimestampProducer(FIXED_TIMESTAMP);
      const newTimestamp = 1640995260000; // 1 minute later
      
      expect(mockProducer.getNow()).toBe(FIXED_TIMESTAMP);
      
      mockProducer.setTimestamp(newTimestamp);
      expect(mockProducer.getNow()).toBe(newTimestamp);
    });

    it('should allow advancing timestamp', () => {
      const mockProducer = new MockTimestampProducer(FIXED_TIMESTAMP);
      const advanceMs = 60000; // 1 minute
      
      expect(mockProducer.getNow()).toBe(FIXED_TIMESTAMP);
      
      mockProducer.advanceBy(advanceMs);
      expect(mockProducer.getNow()).toBe(FIXED_TIMESTAMP + advanceMs);
    });

    it('should allow setting timestamp from Date', () => {
      const mockProducer = new MockTimestampProducer();
      const testDate = new Date('2023-06-15T10:30:00.000Z');
      
      mockProducer.setDate(testDate);
      expect(mockProducer.getNow()).toBe(testDate.getTime());
    });

    it('should implement TimestampProducer interface', () => {
      const mockProducer: TimestampProducer = new MockTimestampProducer();
      
      expect(mockProducer.getNow).toBeDefined();
      expect(typeof mockProducer.getNow).toBe('function');
      expect(typeof mockProducer.getNow()).toBe('number');
    });
  });

  describe('Interface compatibility', () => {
    it('should allow using either implementation as TimestampProducer', () => {
      const defaultProducer: TimestampProducer = new DefaultTimestampProducer();
      const mockProducer: TimestampProducer = new MockTimestampProducer(1640995200000);

      // Both should work as TimestampProducer
      expect(typeof defaultProducer.getNow()).toBe('number');
      expect(typeof mockProducer.getNow()).toBe('number');
      
      // Mock should return predictable value
      expect(mockProducer.getNow()).toBe(1640995200000);
    });
  });

  describe('Testing scenarios', () => {
    it('should enable deterministic testing with mock', () => {
      const mockProducer = new MockTimestampProducer();
      const testTimestamp = 1609459200000; // 2021-01-01 00:00:00 UTC
      
      mockProducer.setTimestamp(testTimestamp);
      
      // Simulate multiple operations that should have same timestamp
      const operation1Time = mockProducer.getNow();
      const operation2Time = mockProducer.getNow();
      const operation3Time = mockProducer.getNow();
      
      expect(operation1Time).toBe(testTimestamp);
      expect(operation2Time).toBe(testTimestamp);
      expect(operation3Time).toBe(testTimestamp);
    });

    it('should enable testing time-based scenarios', () => {
      const mockProducer = new MockTimestampProducer();
      const startTime = 1609459200000; // 2021-01-01 00:00:00 UTC
      
      mockProducer.setTimestamp(startTime);
      
      // Simulate time passing
      const createdAt = mockProducer.getNow();
      expect(createdAt).toBe(startTime);
      
      // Advance time by 1 hour
      mockProducer.advanceBy(3600000);
      const updatedAt = mockProducer.getNow();
      expect(updatedAt).toBe(startTime + 3600000);
      
      // Verify time difference
      expect(updatedAt - createdAt).toBe(3600000);
    });
  });
});
