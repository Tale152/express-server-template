import { ContainerDAO } from '../../src/domain/interfaces/ContainerDAO';
import { UserDAO } from '../../src/domain/interfaces/dao/UserDAO';
import { AccessTokenDAO } from '../../src/domain/interfaces/dao/AccessTokenDAO';
import { RefreshTokenDAO } from '../../src/domain/interfaces/dao/RefreshTokenDAO';
import { ProjectDAO, GetAllProjectsResult } from '../../src/domain/interfaces/dao/ProjectDAO';
import { User } from '../../src/domain/interfaces/entities/User';
import { AccessToken } from '../../src/domain/interfaces/entities/AccessToken';
import { RefreshToken } from '../../src/domain/interfaces/entities/RefreshToken';
import { Project } from '../../src/domain/interfaces/entities/Project';
import { DatabaseSession } from '../../src/domain/interfaces/DatabaseSession';

/**
 * Mock implementation of UserDAO for testing
 */
class MockUserDAO implements UserDAO<unknown> {
  createUser = jest.fn<Promise<User | null>, [DatabaseSession<unknown>, string, string]>();
  findById = jest.fn<Promise<User | null>, [string]>();
  findByUsername = jest.fn<Promise<User | null>, [string]>();
  findByUsernameWithPassword = jest.fn<Promise<User | null>, [string]>();
}

/**
 * Mock implementation of AccessTokenDAO for testing
 */
class MockAccessTokenDAO implements AccessTokenDAO<unknown> {
  createAccessToken = jest.fn<Promise<AccessToken>, [DatabaseSession<unknown>, string, string, Date, number]>();
  findAccessToken = jest.fn<Promise<AccessToken | null>, [string]>();
  revokeAccessToken = jest.fn<Promise<boolean>, [DatabaseSession<unknown>, string, number]>();
}

/**
 * Mock implementation of RefreshTokenDAO for testing
 */
class MockRefreshTokenDAO implements RefreshTokenDAO<unknown> {
  createRefreshToken = jest.fn<Promise<RefreshToken>, [DatabaseSession<unknown>, string, string, Date, number]>();
  findRefreshToken = jest.fn<Promise<RefreshToken | null>, [string]>();
  revokeRefreshToken = jest.fn<Promise<boolean>, [DatabaseSession<unknown>, string, number]>();
  cleanExpiredRefreshTokens = jest.fn<Promise<void>, [DatabaseSession<unknown>, Date]>();
}

/**
 * Mock implementation of ProjectDAO for testing
 */
class MockProjectDAO implements ProjectDAO<unknown> {
  createProject = jest.fn<Promise<Project | null>, [DatabaseSession<unknown>, string, string, string, number]>();
  findById = jest.fn<Promise<Project | null>, [string]>();
  findByUserId = jest.fn<Promise<GetAllProjectsResult>, [string, number, number]>();
  updateProject = jest.fn<Promise<Project | null>, 
    [DatabaseSession<unknown>, string, string, number, string?, string?]>();
  deleteProject = jest.fn<Promise<boolean>, [DatabaseSession<unknown>, string, string]>();
  isProjectOwnedByUser = jest.fn<Promise<boolean>, [string, string]>();
  getAllProjects = jest.fn<Promise<GetAllProjectsResult>, [number, number]>();
}

/**
 * Mock implementation of ContainerDAO for testing
 */
export class MockContainerDAO implements ContainerDAO<unknown> {
  public readonly userDAO: UserDAO<unknown>;
  public readonly accessTokenDAO: AccessTokenDAO<unknown>;
  public readonly refreshTokenDAO: RefreshTokenDAO<unknown>;
  public readonly projectDAO: ProjectDAO<unknown>;

  constructor() {
    this.userDAO = new MockUserDAO();
    this.accessTokenDAO = new MockAccessTokenDAO();
    this.refreshTokenDAO = new MockRefreshTokenDAO();
    this.projectDAO = new MockProjectDAO();
  }
}
