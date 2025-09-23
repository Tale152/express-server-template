import mongoose, { ClientSession } from 'mongoose';

import { DatabaseSessionProducer } from '../interfaces/DatabaseSessionProducer';
import { MongoDBSession } from './MongoDBSession';
import { DatabaseSession } from '../interfaces/DatabaseSession';

/**
 * MongoDB implementation of the DatabaseSessionProducer interface
 * 
 * Creates and manages MongoDB database sessions for transaction support.
 * This producer handles the lifecycle of MongoDB ClientSessions while providing
 * a database-agnostic interface for session management.
 * 
 * Key Features:
 * - Automatic session creation and cleanup
 * - Transaction lifecycle management with proper error handling
 * - Resource leak prevention through guaranteed session cleanup
 * - Database-agnostic session abstraction
 * 
 * @implements {DatabaseSessionProducer<ClientSession>}
 */
export class MongoDBSessionProducer implements DatabaseSessionProducer<ClientSession> {

  /**
   * Create a new database session
   * 
   * Creates a MongoDB ClientSession wrapped in a database-agnostic interface.
   * The session can be used for transaction management and must be properly
   * closed after use to prevent resource leaks.
   * 
   * @returns {Promise<DatabaseSession<ClientSession>>} A new database session wrapper
   * 
   * @throws {Error} If session creation fails (e.g., database connection issues)
   */
  createSession(): Promise<DatabaseSession<ClientSession>> {
    return new Promise((resolve, reject) => {
      mongoose.startSession()
        .then((session) => {
          resolve(new MongoDBSession(session));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

}