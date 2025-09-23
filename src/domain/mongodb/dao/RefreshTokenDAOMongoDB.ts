import mongoose, { ClientSession } from 'mongoose';
import { RefreshTokenMongoDB, RefreshTokenMongoDBInterface } from '../entities/RefreshTokenMongoDB';
import { RefreshToken } from '../../interfaces/entities/RefreshToken';
import { RefreshTokenDAO } from '../../interfaces/dao/RefreshTokenDAO';
import { DatabaseSession } from '../../interfaces/DatabaseSession';
import { extractUserIdString } from '../utils/MongoDBErrorUtils';

/**
 * MongoDB implementation of the RefreshTokenDAO interface
 * 
 * @implements {RefreshTokenDAO<ClientSession>}
 */
export class RefreshTokenDAOMongoDB implements RefreshTokenDAO<ClientSession> {
  
  /**
   * Convert MongoDB document to RefreshToken interface
   * 
   * Handles complex userId field conversion supporting both ObjectId references
   * and populated User objects from MongoDB queries.
   * 
   * @param {RefreshTokenMongoDBInterface} doc - MongoDB refresh token document
   * @returns {RefreshToken} Clean refresh token entity with string IDs
   */
  private documentToRefreshToken(doc: RefreshTokenMongoDBInterface): RefreshToken {
    // Extract userId properly handling ObjectId and populated User cases  
    const userIdString = extractUserIdString(doc.userId as unknown);
    
    return {
      id: (doc._id as mongoose.Types.ObjectId).toString(),
      userId: userIdString,
      token: doc.token,
      expiresAt: doc.expiresAt,
      isRevoked: doc.isRevoked,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * Create a new refresh token
   * 
   * Creates refresh token with automatic timestamp management and session support
   * for transaction consistency.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {string} userId - User ID associated with the token
   * @param {string} token - JWT refresh token string (must be unique)
   * @param {Date} expiresAt - Token expiration date
   * @param {number} now - Current timestamp for createdAt/updatedAt
   * @returns {Promise<RefreshToken>} Created refresh token entity
   */
  public async createRefreshToken(
    session: DatabaseSession<ClientSession>,
    userId: string,
    token: string,
    expiresAt: Date,
    now: number
  ): Promise<RefreshToken> {
    const currentDate = new Date(now);
    const savedToken = await new RefreshTokenMongoDB({
      userId,
      token,
      expiresAt,
      createdAt: currentDate,
      updatedAt: currentDate
    }).save({ session: session.session });

    return this.documentToRefreshToken(savedToken);
  }

  /**
   * Find refresh token by token string
   * 
   * Retrieves non-revoked refresh token with user information populated.
   * Filters out revoked tokens for security.
   * 
   * @param {string} token - JWT refresh token string to find
   * @returns {Promise<RefreshToken | null>} Refresh token with user data or null if not found
   */
  public async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await RefreshTokenMongoDB.findOne({
      token, 
      isRevoked: false 
    }).populate('userId').exec();

    return refreshToken ? this.documentToRefreshToken(refreshToken) : null;
  }

  /**
   * Revoke refresh token
   * 
   * Marks refresh token as revoked with timestamp update. Safe to call
   * multiple times - returns false if token doesn't exist.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {string} token - JWT refresh token string to revoke
   * @param {number} now - Current timestamp for updatedAt field
   * @returns {Promise<boolean>} true if token was found and revoked, false if not found
   */
  public async revokeRefreshToken(
    session: DatabaseSession<ClientSession>, 
    token: string, 
    now: number
  ): Promise<boolean> {
    const result = await RefreshTokenMongoDB.updateOne(
      { token },
      { $set: { isRevoked: true, updatedAt: new Date(now) } },
      { session: session.session }
    ).exec();
    
    return result.modifiedCount > 0;
  }

  /**
   * Clean expired refresh tokens
   * 
   * Removes refresh tokens that have passed their expiration date.
   * Maintenance operation to prevent token storage bloat.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {Date} expirationDate - Date threshold for token cleanup
   * @returns {Promise<void>} Resolves when cleanup is complete
   */
  public async cleanExpiredRefreshTokens(session: DatabaseSession<ClientSession>, expirationDate: Date): Promise<void> {
    await RefreshTokenMongoDB.deleteMany(
      { expiresAt: { $lt: expirationDate } },
      { session: session.session }
    ).exec();
  }
}
