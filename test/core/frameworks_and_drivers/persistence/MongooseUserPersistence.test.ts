import {
  createConnectionToTestDB,
  dropConnectedTestDB,
} from '../../../utils/db_test_connection';
import MongooseUserPersistence from '../../../../src/core/frameworks_and_drivers/persistence/MongooseUserPersistence';
import {UnpersistedUser} from '../../../../src/core/entities/User';
import UserModel from '../../../../src/core/frameworks_and_drivers/persistence/mongoose/UserModel';

beforeAll((done) => createConnectionToTestDB(done));
afterAll((done) => dropConnectedTestDB(done));

const persistence = new MongooseUserPersistence();


test('Check for the existence of an User', async () => {
  const user = new UnpersistedUser('existence', 'password');
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
  const user = new UnpersistedUser('creation', 'password');
  expect(await persistence.exists(user.username)).toBeFalsy();
  expect(await persistence.createNew(user)).toBeTruthy();
  expect(await persistence.exists(user.username)).toBeTruthy();
});

test('Check that an User with the username of an existing User cannot be created', async () => {
  const user = new UnpersistedUser('duplicate', 'password');
  expect(await persistence.exists(user.username)).toBeFalsy();
  expect(await persistence.createNew(user)).toBeTruthy();
  expect(await persistence.exists(user.username)).toBeTruthy();
  expect(await persistence.createNew(user)).toBeFalsy();
});

test('Check retrieval of an User by username', async () => {
  const user = new UnpersistedUser('ByUsername', 'password');
  expect(await persistence.getByUsername(user.username)).toBe(undefined);
  await persistence.createNew(user);
  const retreivedUser = await persistence.getByUsername(user.username);
  expect(retreivedUser?.username).toBe(user.username);
  expect(retreivedUser?.password).toBe(user.password);
});

test('Check retrieval of an User by id', async () => {
  const user = new UnpersistedUser('ById', 'password');
  await persistence.createNew(user);
  const retreivedUser = await persistence.getByUsername(user.username);
  if(retreivedUser !== undefined){
    const retreivedUserById = await persistence.getById(retreivedUser.id);
    expect(retreivedUserById?.username).toBe(user.username)
  }
});
