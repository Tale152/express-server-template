import supertest from 'supertest';
import {EncryptedToken} from '../../../src/core/entities/Token';
import server from '../../../src/server';
import {
  createConnectionToTestDB,
  dropConnectedTestDB,
} from '../../utils/db_test_connection';
import {user, registerUser} from '../utils';

var token: EncryptedToken;
const usernameQuery = {
  username: user.username,
};

beforeAll(async () => {
  await createConnectionToTestDB();
  token = await registerUser(server, user);
});
afterAll(dropConnectedTestDB);

test('Trying to retrieve a User without a token', async () => {
  await supertest(server).get('/user/get-by').query(usernameQuery).expect(401);
  await supertest(server)
    .get('/user/get-by')
    .query(usernameQuery)
    .set({token: 'abc123'})
    .expect(401);
});

test('Retreiving user by username', async () => {
  await supertest(server)
    .get('/user/get-by')
    .query(usernameQuery)
    .set({token: token.value})
    .expect(200)
    .then((res) => {
      expect(res.body.username).toEqual(user.username);
      expect(res.body.id).toBeDefined();
    });
  await supertest(server)
    .get('/user/get-by')
    .query({
      username: 'not existing',
    })
    .set({token: token.value})
    .expect(204);
});

test('Retreiving user by id', async () => {
  var id: string = '';
  await supertest(server)
    .get('/user/get-by')
    .query(usernameQuery)
    .set({token: token.value})
    .expect(200)
    .then((res) => (id = res.body.id));
  if (id === '') {
    fail();
  }
  await supertest(server)
    .get('/user/get-by')
    .query({
      id: id,
    })
    .set({token: token.value})
    .expect(200)
    .then((res) => {
      expect(res.body.username).toEqual(user.username);
      expect(res.body.id).toEqual(id);
    });
  await supertest(server)
    .get('/user/get-by')
    .query({
      id: 'abc123',
    })
    .set({token: token.value})
    .expect(204);
});

test('Calling route with incorrect parameters', async () => {
  await supertest(server)
    .get('/user/get-by')
    .set({token: token.value})
    .expect(400);
  await supertest(server)
    .get('/user/get-by')
    .query({
      id: '',
    })
    .set({token: token.value})
    .expect(400);
  await supertest(server)
    .get('/user/get-by')
    .query({
      username: '',
    })
    .set({token: token.value})
    .expect(400);
});
