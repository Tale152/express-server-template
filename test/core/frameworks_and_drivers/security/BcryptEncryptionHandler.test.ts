import * as bcrypt from 'bcrypt';
import BcryptEncryptionHandler from '../../../../src/core/frameworks_and_drivers/security/BcryptEncryptionHandler';

test('The BcryptEncryptionHandler encrypt and compare functions should behave like the bcrypt ones', async () => {
  const encryptionHandler = new BcryptEncryptionHandler();
  const toEncrypt = 'a string with trailing space ';
  const encrypted = await encryptionHandler.encrypt(toEncrypt);
  expect(await bcrypt.compare(toEncrypt, encrypted)).toEqual(
    await encryptionHandler.compare(toEncrypt, encrypted),
  );
  const differentString = toEncrypt + 'abc';
  expect(await bcrypt.compare(differentString, encrypted)).toEqual(
    await encryptionHandler.compare(differentString, encrypted),
  );
});
