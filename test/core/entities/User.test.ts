import User from '../../../src/core/entities/User';

const emptyString: string = '';
const validUsername: string = 'user';
const validPassword: string = 'password';
const extraSpaces: string = '\t  \t';

test('An User must have a valid username', () => {
  // @ts-ignore
  assertUserThrowsOnNewInstance(undefined, validPassword);
  // @ts-ignore
  assertUserThrowsOnNewInstance(null, validPassword);
  assertUserThrowsOnNewInstance(emptyString, validPassword);
});

test('An User must have a valid password', () => {
  // @ts-ignore
  assertUserThrowsOnNewInstance(validUsername, undefined);
  // @ts-ignore
  assertUserThrowsOnNewInstance(validUsername, null);
  assertUserThrowsOnNewInstance(validUsername, emptyString);
});

test('An User should return the correct username and password', () => {
  const user: User = User.createInstance(validUsername, validPassword);
  expect(user.username).toEqual(validUsername);
  expect(user.password).toEqual(validPassword);
});

test('Username and password should not contain extra spaces', () => {
  const user: User = User.createInstance(
    addExtraSpaces(validUsername),
    addExtraSpaces(validPassword),
  );
  expect(user.username).toEqual(validUsername);
  expect(user.password).toEqual(validPassword);
});

function assertUserThrowsOnNewInstance(
  username: string,
  password: string,
): void {
  expect(() => User.createInstance(username, password)).toThrow();
}

function addExtraSpaces(str: string): string {
  return extraSpaces + str + extraSpaces;
}
