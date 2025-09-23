import request from 'supertest';
import { Application } from 'express';
import { createTestCredentials } from '../../helpers';
import { ProjectResponse } from '../../../../src/dto/project/ProjectResponse';
import { ProjectListResponse } from '../../../../src/dto/project/ProjectListResponse';

/**
 * Project test utilities
 */

// Counter for unique project names
let projectCounter = 0;

/**
 * Create test project data
 */
export const createTestProject = () => {
  projectCounter++;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 8);
  const uniqueSuffix = `${timestamp}_${random}_${projectCounter}`;
  
  return {
    name: `Test Project ${uniqueSuffix}`,
    gitUrl: `https://github.com/testuser/project-${uniqueSuffix}.git`,
  };
};

/**
 * Response type for project endpoints (using supertest response wrapper)
 */
type ProjectApiResponse = {
  body: ProjectResponse;
};

/**
 * Response type for project list endpoints (using supertest response wrapper)
 */
type ProjectListApiResponse = {
  body: ProjectListResponse;
};

/**
 * Validate project response structure
 */
export const validateProjectResponse = (response: ProjectApiResponse) => {
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('name');
  expect(response.body).toHaveProperty('gitUrl');
  expect(response.body).toHaveProperty('userId');
  expect(response.body).toHaveProperty('createdAt');
  expect(response.body).toHaveProperty('updatedAt');
  
  expect(typeof response.body.id).toBe('string');
  expect(typeof response.body.name).toBe('string');
  expect(typeof response.body.gitUrl).toBe('string');
  expect(typeof response.body.userId).toBe('string');
  expect(response.body.id.length).toBeGreaterThan(0);
  expect(response.body.name.length).toBeGreaterThan(0);
  expect(response.body.gitUrl.length).toBeGreaterThan(0);
  expect(response.body.userId.length).toBeGreaterThan(0);
};

/**
 * Validate project list response structure
 */
export const validateProjectListResponse = (response: ProjectListApiResponse) => {
  expect(response.body).toHaveProperty('projects');
  expect(response.body).toHaveProperty('total');
  expect(response.body).toHaveProperty('totalPages');
  expect(response.body).toHaveProperty('currentPage');
  expect(response.body).toHaveProperty('limit');
  
  expect(Array.isArray(response.body.projects)).toBe(true);
  expect(typeof response.body.total).toBe('number');
  expect(typeof response.body.totalPages).toBe('number');
  expect(typeof response.body.currentPage).toBe('number');
  expect(typeof response.body.limit).toBe('number');
  
  // Validate each project in the list
  response.body.projects.forEach((project) => {
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('name');
    expect(project).toHaveProperty('gitUrl');
    expect(project).toHaveProperty('userId');
    expect(project).toHaveProperty('createdAt');
    expect(project).toHaveProperty('updatedAt');
  });
};

/**
 * Create a project via API and return the response
 */
export const createProjectViaAPI = async (
  app: Application,
  token: string,
  projectData?: { name: string; gitUrl: string }
) => {
  const project = projectData || createTestProject();
  
  const response = await request(app)
    .post('/project')
    .set('Authorization', `Bearer ${token}`)
    .send(project)
    .expect(201);
    
  return response;
};

/**
 * Create a user and get auth token for project tests
 */
export const createUserAndGetToken = async (app: Application) => {
  const credentials = createTestCredentials();
  
  const authResponse = await request(app)
    .post('/auth/register')
    .send(credentials)
    .expect(201);
    
  return {
    user: authResponse.body.user,
    token: authResponse.body.accessToken,
    credentials
  };
};
