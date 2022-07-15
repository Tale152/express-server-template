import {
  createConnectionToTestDB,
  dropConnectedTestDB,
} from '../../../utils/db_test_connection';
import MongooseUserPersistence
  from '../../../../src/core/frameworks_and_drivers/persistence/MongooseUserPersistence';
import {UnpersistedUser} from '../../../../src/core/entities/User';
import UserModel
  from '../../../../src/core/frameworks_and_drivers/persistence/mongoose/UserModel';

const dioBrando = new UnpersistedUser('DioBrando', 'the world');
const jotaroKujo = new UnpersistedUser('JotaroKujo', 'star platinum');

beforeAll(async () => {
  createConnectionToTestDB();
  const userToPersist = new UserModel({
    username: dioBrando.username,
    password: dioBrando.password,
  });
  const res = await new Promise((resolve) => {
    userToPersist.save((err) => {
      err ? resolve(false) : resolve(true);
    });
  });
  expect(res).toBeTruthy();
});
afterAll(dropConnectedTestDB);

const persistence = new MongooseUserPersistence();

test('Check for the existence of an User', async () => {
  expect(await persistence.exists(dioBrando.username)).toBeTruthy();
  expect(await persistence.exists(jotaroKujo.username)).toBeFalsy();
});

test('Check that an User can be created', async () => {
  const josephJoestar = new UnpersistedUser('JosephJoestar', 'hamon_sounds');
  expect(await persistence.exists(josephJoestar.username)).toBeFalsy();
  expect(await persistence.createNew(josephJoestar)).toBeTruthy();
  expect(await persistence.exists(josephJoestar.username)).toBeTruthy();
});

test('Check that an User with the username of an existing User cannot be created', async () => {
  expect(await persistence.exists(dioBrando.username)).toBeTruthy();
  expect(await persistence.createNew(dioBrando)).toBeFalsy();
});

test('Check retrieval of an User by username', async () => {
  expect(await persistence.getByUsername(jotaroKujo.username)).toBe(undefined);
  const retreivedUser = await persistence.getByUsername(dioBrando.username);
  expect(retreivedUser?.username).toBe(dioBrando.username);
});

test('Check retrieval of an User by id', async () => {
  const retreivedUser = await persistence.getByUsername(dioBrando.username);
  if (retreivedUser !== undefined) {
    const retreivedUserById = await persistence.getById(retreivedUser.id);
    expect(retreivedUserById?.username).toBe(dioBrando.username);
  } else {
    fail();
  }
  expect(await persistence.getById('invalid id')).toBe(undefined);
  expect(await persistence.getById('62d195716312dc5e105571a7')).toBe(undefined);
});
