import jwt from 'jsonwebtoken';
import {
  EncryptedToken,
  DecryptedToken,
} from '../../../../src/core/entities/Token';
import JwtTokenGenerator from '../../../../src/core/frameworks_and_drivers/security/JwtTokenGenerator';
import EnvVariablesSingleton from '../../../../src/setup/EnvVariablesSingleton';

const generator = new JwtTokenGenerator();
const originalDecryptedToken = new DecryptedToken('abc123');
const tokenSecret = EnvVariablesSingleton.instance.tokenSecret;

test('The JwtTokenGenerator encrypt and decode functions should behave like jwt\' sign and verify functions', async () => {
  const generatorEncryptedToken = generator.encrypt(originalDecryptedToken);
  const jwtVerifiedToken = jwt.verify(
    generatorEncryptedToken.value,
    tokenSecret,
  );
  if (typeof jwtVerifiedToken !== 'string') {
    expect(jwtVerifiedToken.id).toEqual(originalDecryptedToken.id);
    expect(jwtVerifiedToken.id).toEqual(
      generator.decode(generatorEncryptedToken)?.id,
    );
  } else {
    fail();
  }
  expect(generator.decode(new EncryptedToken('asd'))).toBe(
    undefined,
  );
});

test('JwtTokenGenerator whould check for token validity while decoding', async () => {
  const jwtSignedToken = jwt.sign(originalDecryptedToken.payload, tokenSecret, {
    expiresIn: '1s',
  });
  const encryptedToken = new EncryptedToken(jwtSignedToken);
  await new Promise((r) => setTimeout(r, 1100));
  expect(generator.decode(encryptedToken)).toBe(undefined);
});
