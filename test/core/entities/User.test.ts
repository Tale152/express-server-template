import User from '../../../src/core/entities/User';

const emptyString: string = '';
const validId: string = 'abc123';
const validUsername: string = 'user';
const validPassword: string = 'password';
const extraSpaces: string = '\t  \t';

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

test('Id, username, password should not contain extra spaces', () => {
  const user: User = new User(
    addExtraSpaces(validId),
    addExtraSpaces(validUsername),
    addExtraSpaces(validPassword),
  );
  expect(user.id).toEqual(validId);
  expect(user.username).toEqual(validUsername);
  expect(user.password).toEqual(validPassword);
});

function assertUserThrowsOnNewInstance(
  id: string,
  username: string,
  password: string,
): void {
  expect(() => new User(id, username, password)).toThrow();
}

function addExtraSpaces(str: string): string {
  return extraSpaces + str + extraSpaces;
}
