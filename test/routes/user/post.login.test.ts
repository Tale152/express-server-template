import supertest from 'supertest';
import server from '../../../src/server';
import {
  createConnectionToTestDB,
  dropAndDisconnectTestDB,
} from '../../utils/db_test_connection';
import {testUser, registerUser} from '../utils';

beforeAll(async () => {
  await createConnectionToTestDB();
  await registerUser(server, testUser);
});
afterAll(dropAndDisconnectTestDB);

test('Login to an existing user', async () => {
  await supertest(server)
    .post('/user/login')
    .send(testUser)
    .expect(200)
    .then((res) => expect(res.body.token).toBeDefined());
});

test('Try to login to a non-existing user', async () => {
  await supertest(server)
    .post('/user/login')
    .send({
      username: 'hello',
      password: 'password',
    })
    .expect(401);
});

test('Try to login with wrong credentials', async () => {
  await supertest(server)
    .post('/user/login')
    .send({
      username: testUser.username,
      password: testUser.password + ' ',
    })
    .expect(401);
});

test('Try to login with wrong arguments', async () => {
  await supertest(server)
    .post('/user/login')
    .send({
      username: testUser.username,
    })
    .expect(400);
  await supertest(server)
    .post('/user/login')
    .send({
      password: testUser.password,
    })
    .expect(400);
});
