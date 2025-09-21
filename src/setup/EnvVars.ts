import dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Configuration interface defining all required environment variables.
 * 
 * This interface ensures type safety for environment variable access
 * and documents the expected configuration structure.
 */
interface EnvConfig {
  /** Name of the server instance */
  SERVER_NAME: string;
  
  /** Port number for the HTTP server */
  PORT: number;
  
  /** Node.js environment (development, production, test) */
  NODE_ENV: string;
  
  /** Array of allowed CORS origins */
  CORS_ORIGIN: string[];
  
  /** MongoDB connection string */
  DATABASE_URL: string;
  
  /** Secret key for signing JWT access tokens */
  JWT_SECRET: string;
  
  /** Expiration time for JWT access tokens (e.g., "15m", "1h") */
  JWT_EXPIRES_IN: string;
  
  /** Secret key for signing JWT refresh tokens */
  JWT_REFRESH_SECRET: string;
  
  /** Expiration time for JWT refresh tokens (e.g., "7d", "30d") */
  JWT_REFRESH_EXPIRES_IN: string;
}

/**
 * Environment variables configuration class.
 * 
 * Handles loading, parsing, and validation of environment variables from
 * process.env with type safety and default values. This class is instantiated
 * once at application startup and injected throughout the application.
 * 
 * Features:
 * - Type-safe environment variable access
 * - Default values for development
 * - Validation and error handling for missing required variables
 * - Utility methods for environment detection
 * - CORS origin parsing (comma-separated values)
 */
export class EnvVars {
  /** Parsed and validated environment configuration */
  private env: EnvConfig;

  /**
   * Creates a new environment configuration instance.
   * 
   * Automatically loads environment variables from process.env,
   * applies defaults, and validates required values.
   * 
   * @throws {Error} When required environment variables are missing or invalid
   */
  public constructor() {
    this.env = this.parseEnvironment();
  }

  /**
   * Parses and validates environment variables from process.env.
   * 
   * Applies default values for development and validates that all
   * required variables are present with correct types.
   * 
   * @returns Validated environment configuration
   * @throws {Error} When required variables are missing or invalid
   * 
   * @private
   */
  private parseEnvironment(): EnvConfig {
    const getEnvVar = (key: string, defaultValue?: string): string => {
      const value = process.env[key];
      if (value === undefined) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(`Environment variable ${key} is required`);
      }
      return value;
    };

    const corsOrigin = getEnvVar('CORS_ORIGIN', 'http://localhost:3000')
      .split(',')
      .map(origin => origin.trim());

    const port = parseInt(getEnvVar('PORT', '8080'), 10);
    if (isNaN(port)) {
      throw new Error('PORT must be a valid number');
    }

    return {
      SERVER_NAME: getEnvVar('SERVER_NAME', 'Express Server'),
      PORT: port,
      NODE_ENV: getEnvVar('NODE_ENV', 'development'),
      CORS_ORIGIN: corsOrigin,
      DATABASE_URL: getEnvVar('DATABASE_URL', 'mongodb://localhost:27017/express-server-advanced'),
      JWT_SECRET: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production'),
      JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '15m'),
      JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET', 'your-super-secret-refresh-key-change-in-production'),
      JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
    };
  }

  /**
   * Gets the server name.
   * @returns Server instance name
   */
  get SERVER_NAME(): string {
    return this.env.SERVER_NAME;
  }

  /**
   * Gets the HTTP server port.
   * @returns Port number for the server
   */
  get PORT(): number {
    return this.env.PORT;
  }

  /**
   * Gets the Node.js environment.
   * @returns Environment name (development, production, test)
   */
  get NODE_ENV(): string {
    return this.env.NODE_ENV;
  }

  /**
   * Gets the allowed CORS origins.
   * @returns Array of allowed origin URLs
   */
  get CORS_ORIGIN(): string[] {
    return this.env.CORS_ORIGIN;
  }

  /**
   * Gets the database connection URL.
   * @returns MongoDB connection string
   */
  get DATABASE_URL(): string {
    return this.env.DATABASE_URL;
  }

  /**
   * Gets the JWT access token secret.
   * @returns Secret key for signing access tokens
   */
  get JWT_SECRET(): string {
    return this.env.JWT_SECRET;
  }

  /**
   * Gets the JWT access token expiration time.
   * @returns Time string (e.g., "15m", "1h")
   */
  get JWT_EXPIRES_IN(): string {
    return this.env.JWT_EXPIRES_IN;
  }

  /**
   * Gets the JWT refresh token secret.
   * @returns Secret key for signing refresh tokens
   */
  get JWT_REFRESH_SECRET(): string {
    return this.env.JWT_REFRESH_SECRET;
  }

  /**
   * Gets the JWT refresh token expiration time.
   * @returns Time string (e.g., "7d", "30d")
   */
  get JWT_REFRESH_EXPIRES_IN(): string {
    return this.env.JWT_REFRESH_EXPIRES_IN;
  }

  /**
   * Checks if the application is running in development mode.
   * @returns True if NODE_ENV is 'development'
   */
  get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  /**
   * Checks if the application is running in production mode.
   * @returns True if NODE_ENV is 'production'
   */
  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }
}
