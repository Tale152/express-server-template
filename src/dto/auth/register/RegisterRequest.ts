import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

/**
 * Request for user registration
 */
export class RegisterRequest {
  /**
   * Username for registration
   * @example "john_doe"
   */
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters long' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Username can only contain letters, numbers, underscores, and hyphens' })
    username!: string;

  /**
   * Password for registration
   * @example "MySecurePassword123"
   */
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Length(8, undefined, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })
    password!: string;
}
