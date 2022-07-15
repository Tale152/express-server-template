import jwt from 'jsonwebtoken';
import {EncryptedToken, DecryptedToken} from '../../../src/core/entities/Token';
import JwtTokenGenerator from '../../../src/core/frameworks_and_drivers/security/JwtTokenGenerator';
import EnvVariablesSingleton from '../../../src/setup/EnvVariablesSingleton';

const generator = JwtTokenGenerator.createInstance();
const originalDecryptedToken = DecryptedToken.createInstance('user');
const tokenSecret = EnvVariablesSingleton.instance.tokenSecret;

test("The JwtTokenGenerator encrypt and decode functions should behave like jwt' sign and verify functions", async () => {
  const generatorEncryptedToken = generator.encrypt(originalDecryptedToken);
  const jwtVerifiedToken = jwt.verify(
    generatorEncryptedToken.value,
    tokenSecret,
  );
  if (typeof jwtVerifiedToken !== 'string') {
    expect(jwtVerifiedToken.username).toEqual(originalDecryptedToken.username);
    expect(jwtVerifiedToken.username).toEqual(
      generator.decode(generatorEncryptedToken)?.username,
    );
  } else {
    fail();
  }
  expect(generator.decode(EncryptedToken.createInstance('asd'))).toBe(
    undefined,
  );
});

test('JwtTokenGenerator whould check for token validity while decoding', async () => {
  const jwtSignedToken = jwt.sign(originalDecryptedToken.payload, tokenSecret, {
    expiresIn: '1s',
  });
  const encryptedToken = EncryptedToken.createInstance(jwtSignedToken);
  await new Promise((r) => setTimeout(r, 1100));
  expect(generator.decode(encryptedToken)).toBe(undefined);
});
