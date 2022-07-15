import supertest from 'supertest';
import server from '../../../src/server';
import {
  createConnectionToTestDB,
  resetDB,
  dropConnectedTestDB,
} from '../../utils/db_test_connection';
import {user, registerUser} from '../utils';

beforeAll(createConnectionToTestDB);
beforeEach(resetDB);
afterAll(dropConnectedTestDB);

test('Register a new user', async () => {
  await registerUser(server, user);
});

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
  await registerUser(server, user);
  await supertest(server).post('/user/register').send(user).expect(406);
});
