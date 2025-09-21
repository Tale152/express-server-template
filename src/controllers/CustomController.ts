import { Controller } from 'tsoa';
import { EnvVars } from '../setup/EnvVars';
import { ContainerDAO } from '../domain/interfaces/ContainerDAO';
import { DatabaseSession } from '../domain/interfaces/DatabaseSession';

/**
 * Base controller class for simple operations without database transactions.
 * 
 * Provides access to environment variables and DAO container. Use this class
 * for read-only operations or simple business logic that doesn't require
 * transactional database operations.
 */
export abstract class BaseCustomController extends Controller {
  /** Environment variables configuration */
  protected readonly envVars: EnvVars;
  
  /** Container providing access to all DAO instances */
  protected readonly containerDAO: ContainerDAO<unknown>;

  /**
   * Creates a new base controller instance.
   * 
   * @param envVars - Environment variables configuration
   * @param containerDAO - Container providing access to all DAO instances
   */
  protected constructor(envVars: EnvVars, containerDAO: ContainerDAO<unknown>) {
    super();
    this.envVars = envVars;
    this.containerDAO = containerDAO;
  }
}

/**
 * Abstract controller class for operations requiring database transactions.
 * 
 * Extends BaseCustomController with transaction support through a database session.
 * Use this class for write operations, complex business logic, or any operation
 * that requires atomicity across multiple database operations.
 */
export abstract class TransactionAbstractController extends BaseCustomController {
  /** Database session for transaction management */
  protected readonly session: DatabaseSession<unknown>;

  /**
   * Creates a new transaction controller instance.
   * 
   * @param envVars - Environment variables configuration
   * @param containerDAO - Container providing access to all DAO instances
   * @param session - Database session for transaction management
   */
  protected constructor(envVars: EnvVars, containerDAO: ContainerDAO<unknown>, session: DatabaseSession<unknown>) {
    super(envVars, containerDAO);
    this.session = session;
  }
}
