import {Response} from 'supertest';
import supertest from 'supertest';
import server from '../../../src/server';
import {
  createConnectionToTestDB,
  dropAndDisconnectTestDB,
} from '../../utils/db_test_connection';
import {testUser, registerUser} from '../utils';
import {isStringEmpty} from '../../../src/core/utils/checks/stringChecks';

const tokenHeader = {
  token: 'placeholder',
};

const usernameQuery = {
  username: testUser.username,
};

beforeAll(async () => {
  await createConnectionToTestDB();
  const token = await registerUser(server, testUser);
  tokenHeader.token = token.value;
});
afterAll(dropAndDisconnectTestDB);

/**
 * Utility function to avoid code repetition while testing
 * route /user/get-by.
 * @param {number} expect http code expected as result
 * @param {any} [query] data to provide as query parameters
 * @param {any} [headers] data to provide as header
 * @param {function(Response): void} [then] callback to execute after
 * the response
 */
async function getBy(
  expect: number,
  query?: any,
  headers?: any,
  then?: (res: Response) => void,
) {
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
    expect(res.body.username).toEqual(testUser.username);
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
    expect(typeof res.body.id === 'string').toBeTruthy();
    expect(isStringEmpty(res.body.id)).toBeFalsy();
    id = res.body.id;
  });
  await getBy(200, {id: id}, tokenHeader, (res) => {
    expect(res.body.username).toEqual(testUser.username);
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
