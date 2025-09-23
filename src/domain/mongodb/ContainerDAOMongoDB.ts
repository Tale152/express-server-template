import { ClientSession } from 'mongoose';
import { ContainerDAO } from '../interfaces/ContainerDAO';
import { UserDAO } from '../interfaces/dao/UserDAO';
import { AccessTokenDAO } from '../interfaces/dao/AccessTokenDAO';
import { RefreshTokenDAO } from '../interfaces/dao/RefreshTokenDAO';
import { ProjectDAO } from '../interfaces/dao/ProjectDAO';
import { UserDAOMongoDB } from './dao/UserDAOMongoDB';
import { AccessTokenDAOMongoDB } from './dao/AccessTokenDAOMongoDB';
import { RefreshTokenDAOMongoDB } from './dao/RefreshTokenDAOMongoDB';
import { ProjectDAOMongoDB } from './dao/ProjectDAOMongoDB';

/**
 * MongoDB implementation of the ContainerDAO interface
 * 
 * Provides concrete MongoDB-based Data Access Objects while maintaining
 * the database-agnostic interface contract. This container serves as the
 * central registry for all MongoDB DAO implementations in the application.
 * 
 * All DAOs are configured to work with MongoDB ClientSession for transaction support,
 * ensuring ACID compliance across related operations within the same session.
 * 
 * @implements {ContainerDAO<ClientSession>}
 */
export class ContainerDAOMongoDB implements ContainerDAO<ClientSession> {
  private readonly _userDAO: UserDAO<ClientSession>;
  private readonly _accessTokenDAO: AccessTokenDAO<ClientSession>;
  private readonly _refreshTokenDAO: RefreshTokenDAO<ClientSession>;
  private readonly _projectDAO: ProjectDAO<ClientSession>;

  /**
   * Initialize MongoDB DAO container
   * 
   * Creates instances of all MongoDB-specific DAO implementations
   * and configures them for ClientSession transaction support.
   * All DAOs are instantiated once and reused throughout the application lifecycle.
   */
  constructor() {
    this._userDAO = new UserDAOMongoDB();
    this._accessTokenDAO = new AccessTokenDAOMongoDB();
    this._refreshTokenDAO = new RefreshTokenDAOMongoDB();
    this._projectDAO = new ProjectDAOMongoDB();
  }

  /**
   * Get User DAO instance
   * 
   * @returns {UserDAO<ClientSession>} MongoDB implementation of User data access
   */
  public get userDAO(): UserDAO<ClientSession> {
    return this._userDAO;
  }

  /**
   * Get AccessToken DAO instance
   * 
   * @returns {AccessTokenDAO<ClientSession>} MongoDB implementation of AccessToken data access
   */
  public get accessTokenDAO(): AccessTokenDAO<ClientSession> {
    return this._accessTokenDAO;
  }

  /**
   * Get RefreshToken DAO instance
   * 
   * @returns {RefreshTokenDAO<ClientSession>} MongoDB implementation of RefreshToken data access
   */
  public get refreshTokenDAO(): RefreshTokenDAO<ClientSession> {
    return this._refreshTokenDAO;
  }

  /**
   * Get Project DAO instance
   * 
   * @returns {ProjectDAO<ClientSession>} MongoDB implementation of Project data access
   */
  public get projectDAO(): ProjectDAO<ClientSession> {
    return this._projectDAO;
  }
}
