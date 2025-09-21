/**
 * Database session abstraction interface for transaction support
 * 
 * This interface provides a database technology agnostic way to handle
 * database sessions and transactions. It abstracts the underlying database's
 * session implementation (e.g., MongoDB ClientSession, PostgreSQL transaction)
 * allowing the domain layer to work with transactions without being tied
 * to any specific database technology.
 * 
 * The session ensures ACID properties across multiple database operations
 * within a single API call, providing atomicity, consistency, isolation,
 * and durability regardless of the underlying database implementation.
 * 
 * @template S - The database-specific session type (e.g., MongoDB ClientSession, PostgreSQL PoolClient)
 */
export interface DatabaseSession<S> {
  /**
   * The underlying database-specific session instance
   * 
   * This allows database-specific DAO implementations to access
   * the native session object when needed while maintaining abstraction
   * at the domain layer.
   */
  readonly session: S;
  
  /**
   * Start a new transaction within this session
   * 
   * After calling this method, all subsequent database operations
   * using this session will be part of the same transaction until
   * either commitTransaction() or abortTransaction() is called.
   * 
   * @throws Error if transaction cannot be started
   */
  startTransaction(): Promise<void>;
  
  /**
   * Commit the current transaction
   * 
   * Makes all changes performed within the transaction permanent.
   * The transaction is considered successful and all operations
   * are persisted to the database.
   * 
   * @throws Error if commit fails
   */
  commitTransaction(): Promise<void>;
  
  /**
   * Abort the current transaction
   * 
   * Rolls back all changes performed within the transaction.
   * The database state returns to what it was before the transaction started.
   * This is typically called when an error occurs during transaction execution.
   * 
   * @throws Error if abort fails
   */
  abortTransaction(): Promise<void>;
  
  /**
   * End the session and release resources
   * 
   * Cleans up the session and releases any database resources.
   * Should be called after transaction completion (commit or abort)
   * to prevent resource leaks.
   * 
   * @throws Error if session cleanup fails
   */
  endSession(): Promise<void>;
}
