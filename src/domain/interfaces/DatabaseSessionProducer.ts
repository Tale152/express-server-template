import { DatabaseSession } from './DatabaseSession';

/**
 * Database session producer abstraction interface
 * 
 * This interface provides a database technology agnostic factory for creating
 * database sessions. It abstracts the session creation process, allowing
 * different database implementations (MongoDB, PostgreSQL, MySQL, etc.) to
 * provide their own session creation logic while maintaining a consistent
 * interface contract.
 * 
 * The producer pattern ensures that session creation is centralized and
 * database-specific, while the rest of the application remains agnostic
 * to the underlying database technology.
 * 
 * Sessions created by this producer are used to ensure transactional
 * consistency across multiple database operations within a single API call.
 * 
 * @template S - The database-specific session type (e.g., MongoDB ClientSession, PostgreSQL PoolClient)
 */
export interface DatabaseSessionProducer<S> {
    /**
     * Create a new database session
     * 
     * Implementations should create a database-specific session instance
     * that can be used for transactional operations. The session should
     * be properly initialized and ready for transaction operations.
     * 
     * @returns Promise resolving to a new DatabaseSession instance
     * @throws Error if session creation fails (e.g., connection issues, resource constraints)
     */
    createSession(): Promise<DatabaseSession<S>>;
}