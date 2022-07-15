import {
  EncryptedToken,
  DecryptedToken,
} from '../../../src/core/entities/Token';

const emptyString: string = '';

const validEncryptedTokenVal: string = 'something to encrypt ';
const validDecryptedTokenId: string = 'abc123 ';
const validDecryptedToken: DecryptedToken = new DecryptedToken(
  validDecryptedTokenId,
);

test('An EncryptedToken must be initialized with a valid token string',
  async () => {
    // @ts-ignore
    expect(() => new EncryptedToken(undefined)).toThrow();
    // @ts-ignore
    expect(() => new EncryptedToken(null)).toThrow();
    expect(() => new EncryptedToken(emptyString)).toThrow();
  },
);

test('An EncryptedToken should return the correct value, without trimming it',
  async () => {
    const token: EncryptedToken = new EncryptedToken(validEncryptedTokenVal);
    expect(token.value).toEqual(validEncryptedTokenVal);
  },
);

test('A DecryptedToken must be initialized with a valid username',
  async () => {
    // @ts-ignore
    expect(() => new DecryptedToken(undefined)).toThrow();
    // @ts-ignore
    expect(() => new DecryptedToken(null)).toThrow();
    expect(() => new DecryptedToken(emptyString)).toThrow();
  },
);

test('A DecryptedToken should return the correct id, trimming it',
  async () => {
    expect(validDecryptedToken.id).toEqual(validDecryptedTokenId.trim());
  },
);

test('A DecryptedToken should return the correct payload',
  async () => {
    expect(validDecryptedToken.payload.id).toEqual(validDecryptedTokenId.trim());
  },
);
