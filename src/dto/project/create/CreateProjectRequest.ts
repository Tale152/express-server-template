import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Request for creating a new project
 */
export class CreateProjectRequest {
  /**
   * Project name
   * @example "My Awesome Project"
   */
  @IsNotEmpty({ message: 'Project name is required' })
  @IsString({ message: 'Project name must be a string' })
  @MinLength(1, { message: 'Project name must be at least 1 character long' })
  @MaxLength(100, { message: 'Project name cannot exceed 100 characters' })
    name!: string;

  /**
   * Git repository URL
   * @example "https://github.com/user/repo.git"
   */
  @IsNotEmpty({ message: 'Git URL is required' })
  @IsString({ message: 'Git URL must be a string' })
    gitUrl!: string;
}
