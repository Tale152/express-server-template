import User from '../../../src/core/entities/User';
import {addExtraSpaces} from '../../utils/bad_arguments';

const emptyString: string = '';
const validId: string = 'abc123';
const validUsername: string = 'user';
const validPassword: string = 'password';

test('An User must have a valid id', () => {
  // @ts-ignore
  assertUserThrowsOnNewInstance(undefined, validUsername, validPassword);
  // @ts-ignore
  assertUserThrowsOnNewInstance(null, validUsername, validPassword);
  assertUserThrowsOnNewInstance(emptyString, validUsername, validPassword);
});

test('An User must have a valid username', () => {
  // @ts-ignore
  assertUserThrowsOnNewInstance(validId, undefined, validPassword);
  // @ts-ignore
  assertUserThrowsOnNewInstance(validId, null, validPassword);
  assertUserThrowsOnNewInstance(validId, emptyString, validPassword);
});

test('An User must have a valid password', () => {
  // @ts-ignore
  assertUserThrowsOnNewInstance(validId, validUsername, undefined);
  // @ts-ignore
  assertUserThrowsOnNewInstance(validId, validUsername, null);
  assertUserThrowsOnNewInstance(validId, validUsername, emptyString);
});

test('An User should return the correct id, username and password', () => {
  const user: User = new User(validId, validUsername, validPassword);
  expect(user.id).toEqual(validId);
  expect(user.username).toEqual(validUsername);
  expect(user.password).toEqual(validPassword);
});

test('The username should not contain extra spaces', () => {
  const user: User = new User(
    validId,
    addExtraSpaces(validUsername),
    validPassword,
  );
  expect(user.username).toEqual(validUsername);
});

/**
 * Utility function expecting new User to throw exception.
 * @param {string} id the ID of the User to instantiate
 * @param {string} username the username of the User to instantiate
 * @param {string} password the password of the User to instantiate
 */
function assertUserThrowsOnNewInstance(
  id: string,
  username: string,
  password: string,
): void {
  expect(() => new User(id, username, password)).toThrow();
}
