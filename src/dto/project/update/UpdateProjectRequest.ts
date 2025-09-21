import { IsString, MaxLength, MinLength, IsNotEmpty, ValidateIf } from 'class-validator';

/**
 * Request for updating a project
 */
export class UpdateProjectRequest {
  /**
   * Project name (optional)
   * @example "My Updated Project"
   */
  @ValidateIf((o, value) => value !== undefined)
  @IsString({ message: 'Project name must be a string' })
  @IsNotEmpty({ message: 'Project name cannot be empty' })
  @MinLength(1, { message: 'Project name must be at least 1 character long' })
  @MaxLength(100, { message: 'Project name cannot exceed 100 characters' })
    name?: string;

  /**
   * Git repository URL (optional)
   * @example "https://github.com/user/updated-repo.git"
   */
  @ValidateIf((o, value) => value !== undefined)
  @IsString({ message: 'Git URL must be a string' })
  @IsNotEmpty({ message: 'Git URL cannot be empty' })
    gitUrl?: string;
}
