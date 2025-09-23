import mongoose, { ClientSession } from 'mongoose';
import { ProjectMongoDB, ProjectMongoDBInterface } from '../entities/ProjectMongoDB';
import { Project } from '../../interfaces/entities/Project';
import { ProjectDAO, GetAllProjectsResult } from '../../interfaces/dao/ProjectDAO';
import { DatabaseSession } from '../../interfaces/DatabaseSession';
import { isMongoDBDuplicateKeyError, validateMongoObjectId, validateMongoObjectIds } from '../utils/MongoDBErrorUtils';

/**
 * MongoDB's implementation of the ProjectDAO interface
 * 
 * @implements {ProjectDAO<ClientSession>}
 */
export class ProjectDAOMongoDB implements ProjectDAO<ClientSession> {

  /**
   * Convert MongoDB document to Project interface
   * 
   * Transforms MongoDB document structure to clean domain entity interface.
   * Handles ObjectId conversion for both project ID and user ID references.
   * 
   * @param {ProjectMongoDBInterface} doc - MongoDB project document
   * @returns {Project} Clean project entity with string IDs
   */
  private documentToProject(doc: ProjectMongoDBInterface): Project {
    return {
      id: (doc._id as mongoose.Types.ObjectId).toString(),
      name: doc.name,
      gitUrl: doc.gitUrl,
      userId: doc.userId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * Create a new project with unique name constraint per user
   * 
   * Creates a new project ensuring unique project names within each user's scope.
   * Validates user ID format and handles duplicate name conflicts gracefully.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {string} name - Project name (must be unique per user)
   * @param {string} gitUrl - Git repository URL
   * @param {string} userId - Owner's user ID (MongoDB ObjectId as string)
   * @param {number} now - Current timestamp for createdAt/updatedAt
   * @returns {Promise<Project | null>} Created project or null if name conflict
   * 
   * @throws {AppError} If user ID format is invalid
   * @throws {Error} For database errors other than duplicate name
   */
  public async createProject(
    session: DatabaseSession<ClientSession>,
    name: string,
    gitUrl: string,
    userId: string,
    now: number
  ): Promise<Project | null> {
    validateMongoObjectId(userId, 'user');

    try {
      const currentDate = new Date(now);
      const savedProject = await new ProjectMongoDB({
        name,
        gitUrl,
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: currentDate,
        updatedAt: currentDate
      }).save({ session: session.session });

      return this.documentToProject(savedProject);
    } catch (error: unknown) {
      // Handle MongoDB duplicate key error for project name per user
      if (isMongoDBDuplicateKeyError(error) && error.keyPattern?.name && error.keyPattern?.userId) {
        return null; // Project name already exists for this user
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Type guard for MongoDB duplicate key errors
   * 
   * Identifies MongoDB duplicate key violations for proper error handling
   * in project creation and update operations.
   * 
   * @param {unknown} error - Error object to check
   * @returns {boolean} True if error is MongoDB duplicate key error
   */
  /**
   * Find project by ID
   * 
   * Retrieves a project by its MongoDB ObjectId. Validates ID format
   * before querying to prevent invalid query errors.
   * 
   * @param {string} projectId - Project's MongoDB ObjectId as string
   * @returns {Promise<Project | null>} Project entity or null if not found
   * 
   * @throws {AppError} If project ID format is invalid
   */
  public async findById(projectId: string): Promise<Project | null> {
    validateMongoObjectId(projectId, 'project');
    const project = await ProjectMongoDB.findById(projectId).exec();
    return project ? this.documentToProject(project) : null;
  }

  /**
   * Find all projects for a specific user with pagination
   * 
   * Retrieves user's projects with pagination support, sorted by creation date
   * (newest first). Uses compound index on userId + createdAt for optimal performance.
   * 
   * @param {string} userId - User's MongoDB ObjectId as string
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of projects per page
   * @returns {Promise<GetAllProjectsResult>} Paginated projects with metadata
   * 
   * @throws {AppError} If user ID format is invalid
   */
  public async findByUserId(userId: string, page: number, limit: number): Promise<GetAllProjectsResult> {
    validateMongoObjectId(userId, 'user');

    const skip = (page - 1) * limit;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [projects, total] = await Promise.all([
      ProjectMongoDB.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ProjectMongoDB.countDocuments({ userId: userObjectId }).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      projects: projects.map(project => this.documentToProject(project)),
      total,
      totalPages
    };
  }

  /**
   * Update project by ID with unique name constraint per user
   * 
   * Updates project fields while maintaining ownership validation and unique
   * name constraints. Only updates provided fields, preserving others unchanged.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {string} projectId - Project's MongoDB ObjectId as string
   * @param {string} userId - Owner's user ID for ownership validation
   * @param {number} now - Current timestamp for updatedAt field
   * @param {string} name - Optional new project name (must be unique per user)
   * @param {string} gitUrl - Optional new git repository URL
   * @returns {Promise<Project | null>} Updated project or null if not found/conflict
   * 
   * @throws {AppError} If project ID or user ID format is invalid
   * @throws {Error} For database errors other than duplicate name
   */
  public async updateProject(
    session: DatabaseSession<ClientSession>,
    projectId: string,
    userId: string,
    now: number,
    name?: string,
    gitUrl?: string
  ): Promise<Project | null> {
    validateMongoObjectIds([
      { id: projectId, entityName: 'project' },
      { id: userId, entityName: 'user' }
    ]);

    const updateData: Partial<Project> = {
      updatedAt: new Date(now)
    };
    if (name !== undefined) updateData.name = name;
    if (gitUrl !== undefined) updateData.gitUrl = gitUrl;

    try {
      const updatedProject = await ProjectMongoDB.findOneAndUpdate(
        { 
          _id: new mongoose.Types.ObjectId(projectId),
          userId: new mongoose.Types.ObjectId(userId)
        },
        updateData,
        { 
          new: true,
          session: session.session,
          runValidators: true
        }
      ).exec();

      return updatedProject ? this.documentToProject(updatedProject) : null;
    } catch (error: unknown) {
      // Handle MongoDB duplicate key error for project name per user
      if (isMongoDBDuplicateKeyError(error) && error.keyPattern?.name && error.keyPattern?.userId) {
        return null; // Project name conflict for this user
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Delete project by ID
   * 
   * Deletes a project with ownership validation. Only the project owner
   * can delete their projects, ensuring data security.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {string} projectId - Project's MongoDB ObjectId as string
   * @param {string} userId - Owner's user ID for ownership validation
   * @returns {Promise<boolean>} true if project was deleted, false if not found
   * 
   * @throws {AppError} If project ID or user ID format is invalid
   */
  public async deleteProject(
    session: DatabaseSession<ClientSession>,
    projectId: string,
    userId: string
  ): Promise<boolean> {
    validateMongoObjectIds([
      { id: projectId, entityName: 'project' },
      { id: userId, entityName: 'user' }
    ]);

    const result = await ProjectMongoDB.deleteOne(
      { 
        _id: new mongoose.Types.ObjectId(projectId),
        userId: new mongoose.Types.ObjectId(userId)
      },
      { session: session.session }
    ).exec();

    return result.deletedCount === 1;
  }

  /**
   * Check if user owns the project
   * 
   * Validates project ownership without retrieving the full project data.
   * Optimized for authorization checks before project operations.
   * 
   * @param {string} projectId - Project's MongoDB ObjectId as string
   * @param {string} userId - User's MongoDB ObjectId as string
   * @returns {Promise<boolean>} true if user owns the project, false otherwise
   * 
   * @throws {AppError} If project ID or user ID format is invalid
   */
  public async isProjectOwnedByUser(projectId: string, userId: string): Promise<boolean> {
    validateMongoObjectIds([
      { id: projectId, entityName: 'project' },
      { id: userId, entityName: 'user' }
    ]);

    const project = await ProjectMongoDB.findOne({
      _id: new mongoose.Types.ObjectId(projectId),
      userId: new mongoose.Types.ObjectId(userId)
    }).exec();

    return project !== null;
  }

}
