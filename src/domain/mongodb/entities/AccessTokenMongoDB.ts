import mongoose, { Document } from 'mongoose';
import { AccessToken } from '../../interfaces/entities/AccessToken';
import { createBaseTokenSchema, addTokenIndexes } from '../utils/BaseTokenMongoDB';

/**
 * MongoDB document interface for AccessToken entity
 * Extends AccessToken domain interface and Mongoose Document
 */
export interface AccessTokenMongoDBInterface extends Omit<AccessToken, 'id'>, Document {}

/**
 * MongoDB schema for AccessToken entity
 * Uses base token schema with access_tokens collection name
 */
const AccessTokenMongoDBSchema = createBaseTokenSchema('access_tokens');

// Add common token indexes
addTokenIndexes(AccessTokenMongoDBSchema);

/**
 * MongoDB model for AccessToken entity
 */
export const AccessTokenMongoDB = mongoose.model<AccessTokenMongoDBInterface>('AccessToken', AccessTokenMongoDBSchema);
