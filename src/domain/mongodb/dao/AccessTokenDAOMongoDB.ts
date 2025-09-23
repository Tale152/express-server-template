import mongoose, { ClientSession } from 'mongoose';
import { AccessTokenMongoDB, AccessTokenMongoDBInterface } from '../entities/AccessTokenMongoDB';
import { AccessToken } from '../../interfaces/entities/AccessToken';
import { AccessTokenDAO } from '../../interfaces/dao/AccessTokenDAO';
import { DatabaseSession } from '../../interfaces/DatabaseSession';
import { extractUserIdString } from '../utils/MongoDBErrorUtils';

/**
 * MongoDB implementation of the AccessTokenDAO interface
 * 
 * @implements {AccessTokenDAO<ClientSession>}
 */
export class AccessTokenDAOMongoDB implements AccessTokenDAO<ClientSession> {
  
  /**
   * Convert MongoDB document to AccessToken interface
   * 
   * Handles complex userId field conversion supporting both ObjectId references
   * and populated User objects from MongoDB queries.
   * 
   * @param {AccessTokenMongoDBInterface} doc - MongoDB access token document
   * @returns {AccessToken} Clean access token entity with string IDs
   */
  private documentToAccessToken(doc: AccessTokenMongoDBInterface): AccessToken {
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
   * Create a new access token
   * 
   * Creates access token with automatic timestamp management and session support
   * for transaction consistency.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {string} userId - User ID associated with the token
   * @param {string} token - JWT access token string (must be unique)
   * @param {Date} expiresAt - Token expiration date
   * @param {number} now - Current timestamp for createdAt/updatedAt
   * @returns {Promise<AccessToken>} Created access token entity
   */
  public async createAccessToken(
    session: DatabaseSession<ClientSession>,
    userId: string,
    token: string,
    expiresAt: Date,
    now: number
  ): Promise<AccessToken> {
    const currentDate = new Date(now);
    const savedToken = await new AccessTokenMongoDB({
      userId,
      token,
      expiresAt,
      createdAt: currentDate,
      updatedAt: currentDate
    }).save({ session: session.session });

    return this.documentToAccessToken(savedToken);
  }

  /**
   * Find access token by token string
   * 
   * Retrieves non-revoked access token with user information populated.
   * Filters out revoked tokens for security.
   * 
   * @param {string} token - JWT access token string to find
   * @returns {Promise<AccessToken | null>} Access token with user data or null if not found
   */
  public async findAccessToken(token: string): Promise<AccessToken | null> {
    const accessToken = await AccessTokenMongoDB.findOne({
      token, 
      isRevoked: false 
    }).populate('userId').exec();

    return accessToken ? this.documentToAccessToken(accessToken) : null;
  }

  /**
   * Revoke access token
   * 
   * Marks access token as revoked with timestamp update. Safe to call
   * multiple times - returns false if token doesn't exist.
   * 
   * @param {DatabaseSession<ClientSession>} session - Database session for transaction support
   * @param {string} token - JWT access token string to revoke
   * @param {number} now - Current timestamp for updatedAt field
   * @returns {Promise<boolean>} true if token was found and revoked, false if not found
   */
  public async revokeAccessToken(
    session: DatabaseSession<ClientSession>, 
    token: string, 
    now: number
  ): Promise<boolean> {
    const result = await AccessTokenMongoDB.updateOne(
      { token },
      { isRevoked: true, updatedAt: new Date(now) },
      { session: session.session }
    );

    return result.modifiedCount > 0;
  }
}
