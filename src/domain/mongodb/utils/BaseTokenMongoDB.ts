import mongoose, { Schema } from 'mongoose';

/**
 * Base schema definition for token entities
 * Provides common fields and configuration for access and refresh tokens
 */
export function createBaseTokenSchema(collectionName: string): Schema {
  return new Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    }
  }, {
    timestamps: true,
    collection: collectionName
  });
}

/**
 * Adds common compound indexes to token schemas for optimal query performance
 * @param schema - The token schema to add indexes to
 */
export function addTokenIndexes(schema: Schema): void {
  // Compound indexes for better query performance
  schema.index({ userId: 1, isRevoked: 1 });
  schema.index({ token: 1, isRevoked: 1 });
}