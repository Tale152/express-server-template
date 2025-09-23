import mongoose, { ClientSession } from 'mongoose';
import { UserMongoDB, UserMongoDBInterface } from '../entities/UserMongoDB';
import { User } from '../../interfaces/entities/User';
import { UserDAO } from '../../interfaces/dao/UserDAO';
import { DatabaseSession } from '../../interfaces/DatabaseSession';
import { isMongoDBDuplicateKeyError, validateMongoObjectId } from '../utils/MongoDBErrorUtils';

/**
 * MongoDB implementation of the UserDAO interface
 * 
 * @implements {UserDAO<ClientSession>}
 */
export class UserDAOMongoDB implements UserDAO<ClientSession> {

  /**
   * Convert MongoDB document to User interface
   * 
   * Transforms MongoDB document structure to clean domain entity interface.
   * Maps MongoDB's _id to entity's id field while preserving all other properties.
   * 
   * @param {UserMongoDBInterface} doc - MongoDB user document
   * @returns {User} Clean user entity with string ID
   */
  private documentToUser(doc: UserMongoDBInterface): User {
    return {
      id: (doc._id as mongoose.Types.ObjectId).toString(),
      username: doc.username,
      password: doc.password,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * Create a new user with unique username constraint
   * 
   * Creates a new user with hashed password, enforcing username uniqueness
   * at the database level. Returns null if username already exists rather
   * than throwing error for better control flow.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {string} username - Unique username for the user
   * @param {string} hashedPassword - Pre-hashed password (never store plain text)
   * @returns {Promise<User | null>} Created user or null if username exists
   * 
   * @throws {Error} For database errors other than duplicate username
   */
  public async createUser(
    session: DatabaseSession<ClientSession>,
    username: string, 
    hashedPassword: string
  ): Promise<User | null> {
    try {
      const savedUser = await new UserMongoDB({
        username,
        password: hashedPassword
      }).save({ session: session.session });

      return this.documentToUser(savedUser);
    } catch (error: unknown) {
      // Handle MongoDB duplicate key error for username
      if (isMongoDBDuplicateKeyError(error) && error.keyPattern?.username) {
        return null; // Username already exists
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Find user by ID (excluding password)
   * 
   * Retrieves user by MongoDB ObjectId with password field excluded
   * for security. Validates ObjectId format before querying.
   * 
   * @param {string} userId - User's MongoDB ObjectId as string
   * @returns {Promise<User | null>} User without password or null if not found
   * 
   * @throws {AppError} If userId format is invalid
   */
  public async findById(userId: string): Promise<User | null> {
    validateMongoObjectId(userId, 'user');
    const user = await UserMongoDB.findById(userId).select('-password').exec();
    return user ? this.documentToUser(user) : null;
  }

  /**
   * Find user by username (excluding password)
   * 
   * Retrieves user by username with password field excluded for security.
   * Uses MongoDB index on username field for optimal query performance.
   * 
   * @param {string} username - Username to search for
   * @returns {Promise<User | null>} User without password or null if not found
   */
  public async findByUsername(username: string): Promise<User | null> {
    const user = await UserMongoDB.findOne({ username }).select('-password').exec();
    return user ? this.documentToUser(user) : null;
  }

  /**
   * Find user by username including password (for authentication)
   * 
   * Retrieves user by username with password included for authentication purposes.
   * Should only be used during login/authentication flows where password verification
   * is required.
   * 
   * @param {string} username - Username to search for
   * @returns {Promise<User | null>} User with password or null if not found
   * 
   * @security Only use for authentication - password field is included
   */
  public async findByUsernameWithPassword(username: string): Promise<User | null> {
    const user = await UserMongoDB.findOne({ username }).exec();
    return user ? this.documentToUser(user) : null;
  }
}
