import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Request for user login
 */
export class LoginRequest {
  /**
   * Username for login
   * @example "john_doe"
   */
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
    username!: string;

  /**
   * Password for login
   * @example "MySecurePassword123"
   */
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
    password!: string;
}
