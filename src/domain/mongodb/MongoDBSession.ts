import { ClientSession } from 'mongoose';
import { DatabaseSession } from '../interfaces/DatabaseSession';

/**
 * MongoDB implementation of the DatabaseSession interface
 * 
 * Wraps a MongoDB ClientSession to provide database-agnostic transaction support
 * while maintaining access to MongoDB-specific functionality. This wrapper ensures
 * that transaction operations remain consistent across different database implementations.
 * 
 * MongoDB ClientSession Features:
 * - ACID transaction support with multi-document consistency
 * - Automatic retry logic for transient errors
 * - Read and write concern propagation
 * - Causal consistency guarantees
 * 
 * @implements {DatabaseSession<ClientSession>}
 */
export class MongoDBSession implements DatabaseSession<ClientSession> {
  public readonly session: ClientSession;

  /**
   * Initialize MongoDB session wrapper
   * 
   * @param {ClientSession} session - MongoDB ClientSession instance from mongoose
   */
  public constructor(session: ClientSession) {
    this.session = session;
  }

  /**
   * Start a new transaction
   * 
   * Begins a multi-document transaction with default MongoDB transaction options.
   * All subsequent database operations using this session will be part of the transaction
   * until it's committed or aborted.
   * 
   * @returns {Promise<void>} Resolves when transaction is started
   * 
   * @throws {Error} If transaction cannot be started (e.g., session already in transaction)
   */
  public async startTransaction(): Promise<void> {
    this.session.startTransaction();
  }

  /**
   * Commit the current transaction
   * 
   * Permanently applies all changes made during the transaction.
   * Once committed, the changes are visible to other database operations
   * and cannot be rolled back.
   * 
   * @returns {Promise<void>} Resolves when transaction is committed
   * 
   * @throws {Error} If commit fails (e.g., write conflicts, network issues)
   */
  public async commitTransaction(): Promise<void> {
    await this.session.commitTransaction();
  }

  /**
   * Abort the current transaction
   * 
   * Rolls back all changes made during the transaction, returning the database
   * to its state before the transaction began. Safe to call multiple times.
   * 
   * @returns {Promise<void>} Resolves when transaction is aborted
   * 
   * @throws {Error} If abort operation encounters network or session errors
   */
  public async abortTransaction(): Promise<void> {
    await this.session.abortTransaction();
  }

  /**
   * End the database session
   * 
   * Closes the session and releases associated resources. Should be called
   * after transaction completion (commit or abort) to prevent resource leaks.
   * The session cannot be used after calling this method.
   * 
   * @returns {Promise<void>} Resolves when session is closed
   * 
   * @throws {Error} If session cleanup encounters errors
   */
  public async endSession(): Promise<void> {
    await this.session.endSession();
  }
}
