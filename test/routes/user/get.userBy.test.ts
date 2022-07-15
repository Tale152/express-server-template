import {Response} from 'supertest';
import supertest from 'supertest';
import server from '../../../src/server';
import {
  createConnectionToTestDB,
  dropConnectedTestDB,
} from '../../utils/db_test_connection';
import {user, registerUser} from '../utils';

const tokenHeader = {
  token: 'placeholder',
};

const usernameQuery = {
  username: user.username,
};

beforeAll(async () => {
  await createConnectionToTestDB();
  const token = await registerUser(server, user);
  tokenHeader.token = token.value;
});
afterAll(dropConnectedTestDB);

async function getBy(expect: number, query?: any, headers?: any, then?: (res: Response) => void) {
  await supertest(server)
    .get('/user/get-by')
    .query(query === undefined ? {} : query)
    .set(headers === undefined ? {} : headers)
    .expect(expect)
    .then(then === undefined ? (_) => {} : then);
}
test('Trying to retrieve a User without a valid token', async () => {
  await getBy(401, usernameQuery);
  await getBy(401, usernameQuery, {token: 'abc123'});
});

test('Retreiving an existing user by username', async () => {
  await getBy(200, usernameQuery, tokenHeader, (res) => {
    expect(res.body.username).toEqual(user.username);
    expect(res.body.id).toBeDefined();
  });
});

test('Trying to retrieve an user by non-existing username',
  async () => {
    await getBy(204, {username: 'not existing'}, tokenHeader);
  },
);

test('Retreiving an existing user by id', async () => {
  let id: string = '';
  await getBy(200, usernameQuery, tokenHeader, (res) => {
    expect(res.body.id).toBeDefined();
    id = res.body.id;
  });
  await getBy(200, {id: id}, tokenHeader, (res) => {
    expect(res.body.username).toEqual(user.username);
    expect(res.body.id).toEqual(id);
  });
});

test('Trying to retrieve an user by non-existing id', async () => {
  await getBy(204, {id: 'abc123'}, tokenHeader);
});

test('Calling route with incorrect parameters', async () => {
  await getBy(400, {}, tokenHeader);
  await getBy(400, {id: ''}, tokenHeader);
  await getBy(400, {username: ''}, tokenHeader);
});
