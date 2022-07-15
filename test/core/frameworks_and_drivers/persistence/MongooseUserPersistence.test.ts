import {
  createConnectionToTestDB,
  resetTestDB,
  dropConnectedTestDB,
} from '../../../utils/db_test_connection';
import MongooseUserPersistence from '../../../../src/core/frameworks_and_drivers/persistence/MongooseUserPersistence';
import {UnpersistedUser} from '../../../../src/core/entities/User';
import UserModel from '../../../../src/core/frameworks_and_drivers/persistence/mongoose/UserModel';

beforeAll((done) => createConnectionToTestDB(done));
beforeEach(() => resetTestDB());
afterAll((done) => dropConnectedTestDB(done));

const persistence = MongooseUserPersistence.createInstance();
const user = new UnpersistedUser('Username', 'password');

test('Check for the existence of an User', async () => {
  expect(await persistence.exists(user.username)).toBeFalsy();
  const userToPersist = new UserModel({
    username: user.username,
    password: user.password,
  });
  const res = await new Promise((resolve) => {
    userToPersist.save((err) => {
      err ? resolve(false) : resolve(true);
    });
  });
  expect(res).toBeTruthy();
  expect(await persistence.exists(user.username)).toBeTruthy();
});

test('Check that an User can be created', async () => {
  expect(await persistence.exists(user.username)).toBeFalsy();
  expect(await persistence.createNew(user)).toBeTruthy();
  expect(await persistence.exists(user.username)).toBeTruthy();
});

test('Check that an User with the username of an existing User cannot be created', async () => {
  expect(await persistence.exists(user.username)).toBeFalsy();
  expect(await persistence.createNew(user)).toBeTruthy();
  expect(await persistence.exists(user.username)).toBeTruthy();
  expect(await persistence.createNew(user)).toBeFalsy();
});

test('Check retrieval of an User by username', async () => {
  expect(await persistence.getByUsername(user.username)).toBe(undefined);
  await persistence.createNew(user);
  const retreivedUser = await persistence.getByUsername(user.username);
  expect(retreivedUser?.username).toBe(user.username);
  expect(retreivedUser?.password).toBe(user.password);
});
