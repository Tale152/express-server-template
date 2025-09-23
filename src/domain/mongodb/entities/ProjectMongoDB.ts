import mongoose, { Schema, Document } from 'mongoose';
import { Project } from '../../interfaces/entities/Project';

/**
 * MongoDB document interface for Project entity
 * Extends Project domain interface and Mongoose Document
 */
export interface ProjectMongoDBInterface extends Omit<Project, 'id'>, Document {}

/**
 * MongoDB schema for Project entity
 * Includes git URL validation and user-scoped unique project names
 */
const ProjectSchemaMongoDB: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  gitUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic git URL validation (HTTP/HTTPS or SSH)
        return /^(https?:\/\/|git@).+\.git$/.test(v) || /^(https?:\/\/).+/.test(v);
      },
      message: 'Invalid git URL format'
    }
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  }
}, {
  timestamps: true,
  collection: 'projects'
});

// Compound indexes for better query performance
ProjectSchemaMongoDB.index({ userId: 1, createdAt: -1 });
ProjectSchemaMongoDB.index({ userId: 1, name: 1 }, { unique: true }); // Prevent duplicate project names per user

/**
 * MongoDB model for Project entity
 */
export const ProjectMongoDB = mongoose.model<ProjectMongoDBInterface>('Project', ProjectSchemaMongoDB);
