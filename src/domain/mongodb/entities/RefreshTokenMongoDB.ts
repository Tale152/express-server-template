import mongoose, { Document } from 'mongoose';
import { RefreshToken } from '../../interfaces/entities/RefreshToken';
import { createBaseTokenSchema, addTokenIndexes } from '../utils/BaseTokenMongoDB';

/**
 * MongoDB document interface for RefreshToken entity
 * Extends RefreshToken domain interface and Mongoose Document
 */
export interface RefreshTokenMongoDBInterface extends Omit<RefreshToken, 'id'>, Document {}

/**
 * MongoDB schema for RefreshToken entity
 * Uses base token schema with refresh_tokens collection name
 */
const RefreshTokenMongoDBSchema = createBaseTokenSchema('refresh_tokens');

// Add common token indexes
addTokenIndexes(RefreshTokenMongoDBSchema);

/**
 * MongoDB model for RefreshToken entity
 */
export const RefreshTokenMongoDB = mongoose.model<RefreshTokenMongoDBInterface>('RefreshToken', RefreshTokenMongoDBSchema);
