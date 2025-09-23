import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../interfaces/entities/User';

/**
 * MongoDB document interface for User entity
 * Extends User domain interface and Mongoose Document
 */
export interface UserMongoDBInterface extends Omit<User, 'id'>, Document {}

/**
 * MongoDB schema for User entity
 * Includes username uniqueness and validation constraints
 */
const UserSchemaMongoDB: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Compound index for username queries with creation date sorting
UserSchemaMongoDB.index({ username: 1, createdAt: -1 });

/**
 * MongoDB model for User entity
 */
export const UserMongoDB = mongoose.model<UserMongoDBInterface>('User', UserSchemaMongoDB);
