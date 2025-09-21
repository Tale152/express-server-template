import { TimeUtils } from '../../../src/utils/TimeUtils';
import { AppError } from '../../../src/setup/middleware/errorHandler';

describe('TimeUtils', () => {
  describe('parseExpiry', () => {
    it('should parse seconds correctly', () => {
      expect(TimeUtils.parseExpiry('30s')).toBe(30000); // 30 seconds in milliseconds
      expect(TimeUtils.parseExpiry('1s')).toBe(1000);
      expect(TimeUtils.parseExpiry('0s')).toBe(0);
    });

    it('should parse minutes correctly', () => {
      expect(TimeUtils.parseExpiry('1m')).toBe(60000); // 1 minute in milliseconds
      expect(TimeUtils.parseExpiry('15m')).toBe(900000); // 15 minutes
      expect(TimeUtils.parseExpiry('0m')).toBe(0);
    });

    it('should parse hours correctly', () => {
      expect(TimeUtils.parseExpiry('1h')).toBe(3600000); // 1 hour in milliseconds
      expect(TimeUtils.parseExpiry('24h')).toBe(86400000); // 24 hours
      expect(TimeUtils.parseExpiry('0h')).toBe(0);
    });

    it('should parse days correctly', () => {
      expect(TimeUtils.parseExpiry('1d')).toBe(86400000); // 1 day in milliseconds
      expect(TimeUtils.parseExpiry('7d')).toBe(604800000); // 7 days
      expect(TimeUtils.parseExpiry('0d')).toBe(0);
    });

    it('should handle large numbers', () => {
      expect(TimeUtils.parseExpiry('999s')).toBe(999000);
      expect(TimeUtils.parseExpiry('999m')).toBe(59940000);
      expect(TimeUtils.parseExpiry('999h')).toBe(3596400000);
      expect(TimeUtils.parseExpiry('365d')).toBe(31536000000); // 1 year
    });

    it('should throw error for unsupported time units', () => {
      expect(() => TimeUtils.parseExpiry('10x')).toThrow(AppError);
      expect(() => TimeUtils.parseExpiry('10x')).toThrow('Unsupported time unit: x');
    });

    it('should throw error for case sensitive units', () => {
      expect(() => TimeUtils.parseExpiry('10S')).toThrow(AppError);
      expect(() => TimeUtils.parseExpiry('10S')).toThrow('Unsupported time unit: S');
      expect(() => TimeUtils.parseExpiry('10M')).toThrow('Unsupported time unit: M');
      expect(() => TimeUtils.parseExpiry('10H')).toThrow('Unsupported time unit: H');
      expect(() => TimeUtils.parseExpiry('10D')).toThrow('Unsupported time unit: D');
    });

    it('should handle decimal numbers - parseInt truncates', () => {
      // Note: parseInt('1.5') returns 1, so these will parse as integers
      expect(TimeUtils.parseExpiry('1.5s')).toBe(1000); // parseInt truncates to 1
      expect(TimeUtils.parseExpiry('10.2m')).toBe(10 * 60000);
    });

    it('should handle negative numbers - parseInt parses them', () => {
      // Note: parseInt('-1') returns -1, which results in negative milliseconds
      expect(TimeUtils.parseExpiry('-1s')).toBe(-1000);
      expect(TimeUtils.parseExpiry('-10m')).toBe(-600000);
    });

    it('should handle edge cases with parseInt behavior', () => {
      // parseInt behavior: these cases work differently than strict validation
      // parseInt('invalid') returns NaN, parseInt('') returns NaN
      // These result in NaN * multiplier = NaN, which is not what we want
      // but the current implementation doesn't validate against NaN
      
      // For now, just document the actual behavior
      const result1 = TimeUtils.parseExpiry('invalids'); // parseInt('invalid') = NaN
      const result2 = TimeUtils.parseExpiry('s'); // parseInt('') = NaN
      
      expect(isNaN(result1)).toBe(true);
      expect(isNaN(result2)).toBe(true);
    });

    it('should handle whitespace - demonstrates parseInt behavior', () => {
      // parseInt handles leading whitespace in the number part
      // but the unit part includes the whitespace, so it fails on unit lookup
      expect(() => TimeUtils.parseExpiry(' 10s ')).toThrow(AppError);
      expect(() => TimeUtils.parseExpiry('10s ')).toThrow(AppError);
      
      // Leading whitespace in ' 10s' means parseInt(' 10') = 10, unit = 's'
      // This actually works because parseInt trims leading whitespace
      expect(TimeUtils.parseExpiry(' 10s')).toBe(10000);
    });
  });

  describe('common JWT expiry values', () => {
    it('should handle typical JWT access token expiry', () => {
      expect(TimeUtils.parseExpiry('15m')).toBe(900000); // 15 minutes
      expect(TimeUtils.parseExpiry('30m')).toBe(1800000); // 30 minutes
      expect(TimeUtils.parseExpiry('1h')).toBe(3600000); // 1 hour
    });

    it('should handle typical JWT refresh token expiry', () => {
      expect(TimeUtils.parseExpiry('7d')).toBe(604800000); // 7 days
      expect(TimeUtils.parseExpiry('30d')).toBe(2592000000); // 30 days
      expect(TimeUtils.parseExpiry('90d')).toBe(7776000000); // 90 days
    });
  });

  describe('mathematical properties', () => {
    it('should maintain unit conversions', () => {
      expect(TimeUtils.parseExpiry('60s')).toBe(TimeUtils.parseExpiry('1m'));
      expect(TimeUtils.parseExpiry('3600s')).toBe(TimeUtils.parseExpiry('60m'));
      expect(TimeUtils.parseExpiry('3600s')).toBe(TimeUtils.parseExpiry('1h'));
      expect(TimeUtils.parseExpiry('86400s')).toBe(TimeUtils.parseExpiry('1440m'));
      expect(TimeUtils.parseExpiry('86400s')).toBe(TimeUtils.parseExpiry('24h'));
      expect(TimeUtils.parseExpiry('86400s')).toBe(TimeUtils.parseExpiry('1d'));
    });

    it('should be consistent across multiple calls', () => {
      const value = '15m';
      const result1 = TimeUtils.parseExpiry(value);
      const result2 = TimeUtils.parseExpiry(value);
      const result3 = TimeUtils.parseExpiry(value);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});
