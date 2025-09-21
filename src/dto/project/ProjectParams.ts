import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * Request parameters for project endpoints that require projectId
 */
export class ProjectParams {
    /**
     * Project ID (MongoDB ObjectId)
     * @example "507f1f77bcf86cd799439011"
     */
    @IsNotEmpty({ message: 'Project ID is required' })
    @IsString({ message: 'Project ID must be a string' })
    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid project ID format' })
      projectId!: string;
}
