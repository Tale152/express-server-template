import supertest from 'supertest';
import server from '../../../src/server';
import {
  createConnectionToTestDB,
  resetDB,
  dropAndDisconnectTestDB,
} from '../../utils/db_test_connection';
import {testUser, registerUser} from '../utils';

beforeAll(createConnectionToTestDB);
beforeEach(resetDB);
afterAll(dropAndDisconnectTestDB);

test('Register a new user', async () => {
  await registerUser(server, testUser);
});

/**
 * Utility function for testing route /user/register expecting 400 as response
 * @param {any} user wron credentials for the user
 * @return {Promise<void>} A promise to understand when the function has ended
 */
async function registerInvalidCredentialsUser(user: any): Promise<void> {
  return new Promise((resolve) => {
    supertest(server)
      .post('/user/register')
      .send(user)
      .expect(400)
      .then((_) => resolve());
  });
}

test('Trying to register an user with invalid credentials', async () => {
  await registerInvalidCredentialsUser({
    username: 'username',
  });
  await registerInvalidCredentialsUser({
    password: 'password',
  });
  await registerInvalidCredentialsUser({
    username: '  ',
    password: 'password',
  });
  await registerInvalidCredentialsUser({
    username: 'username',
    password: '  ',
  });
});

test('Trying to register an already existing user', async () => {
  await registerUser(server, testUser);
  await supertest(server).post('/user/register').send(testUser).expect(406);
});
