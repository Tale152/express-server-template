import {EncryptedToken, DecryptedToken} from '../../../src/core/entities/Token';

const emptyString: string = '';

const validEncryptedTokenVal: string = 'something to encrypt ';
const validDecryptedTokenId: string = 'abc123 ';
const validDecryptedToken: DecryptedToken = DecryptedToken.createInstance(
  validDecryptedTokenId,
);

test('An EncryptedToken must be initialized with a valid token string', () => {
  // @ts-ignore
  expect(() => EncryptedToken.createInstance(undefined)).toThrow();
  // @ts-ignore
  expect(() => EncryptedToken.createInstance(null)).toThrow();
  expect(() => EncryptedToken.createInstance(emptyString)).toThrow();
});

test('An EncryptedToken should return the correct value, without trimming it', () => {
  const token: EncryptedToken = EncryptedToken.createInstance(
    validEncryptedTokenVal,
  );
  expect(token.value).toEqual(validEncryptedTokenVal);
});

test('A DecryptedToken must be initialized with a valid username', () => {
  // @ts-ignore
  expect(() => DecryptedToken.createInstance(undefined)).toThrow();
  // @ts-ignore
  expect(() => DecryptedToken.createInstance(null)).toThrow();
  expect(() => DecryptedToken.createInstance(emptyString)).toThrow();
});

test('A DecryptedToken should return the correct id, trimming it', () => {
  expect(validDecryptedToken.id).toEqual(
    validDecryptedTokenId.trim(),
  );
});

test('A DecryptedToken should return the correct payload', () => {
  expect(validDecryptedToken.payload.id).toEqual(
    validDecryptedTokenId.trim(),
  );
});
