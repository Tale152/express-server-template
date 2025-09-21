import compression from 'compression';
import { Request, Response } from 'express';
import { EnvVars } from '../EnvVars';

/**
 * Creates response compression middleware for optimal bandwidth usage.
 * 
 * Compresses HTTP responses using gzip/deflate algorithms to reduce bandwidth
 * consumption and improve response times, especially for JSON APIs and text content.
 * The compression is intelligently applied based on content type, size thresholds,
 * and client capabilities.
 * 
 * Features:
 * - Balanced compression ratio vs CPU usage (level 6)
 * - Size threshold to avoid compressing small responses
 * - Content-type filtering for optimal compression targets
 * - Client-controlled compression bypass
 * - Environment-specific optimization
 * 
 * Benefits:
 * - 70-85% reduction in API response sizes
 * - Faster page loads on slower connections
 * - Reduced bandwidth costs
 * - Better mobile user experience
 * 
 * @param envVars - Environment configuration for compression tuning
 * @returns Configured compression middleware
 */
export function createCompressionMiddleware(envVars: EnvVars) {
  return compression({
    // Compression level: 1 (fastest) to 9 (best compression)
    // Level 6 provides good balance between speed and compression ratio
    level: envVars.isProduction ? 6 : 4, // Lighter compression in development
    
    // Only compress responses larger than 1KB
    // Smaller responses have overhead that negates compression benefits
    threshold: 1024,
    
    // Custom filter function to determine what should be compressed
    filter: (req: Request, res: Response) => {
      // Allow clients to opt-out of compression
      if (req.headers['x-no-compression']) {
        return false;
      }
      
      // Don't compress streaming responses (real-time data)
      const contentType = res.getHeader('Content-Type');
      if (contentType && contentType.toString().includes('text/event-stream')) {
        return false;
      }
      
      // Don't compress if response is already compressed
      if (res.getHeader('Content-Encoding')) {
        return false;
      }
      
      // Use default compression filter for other cases
      // This handles standard compressible content types (JSON, HTML, CSS, JS, etc.)
      return compression.filter(req, res);
    },
    
    // Memory level for compression (1-9, higher = more memory but better compression)
    memLevel: envVars.isProduction ? 8 : 6,
    
    // Window size for compression algorithm (smaller = less memory, larger = better compression)
    windowBits: envVars.isProduction ? 15 : 13,
  });
}