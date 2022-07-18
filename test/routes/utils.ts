import supertest from 'supertest';
import {Express} from 'express';
import {EncryptedToken} from '../../src/core/entities/Token';

/**
 * Utility credentials for {@link registerUser}.
 */
export const testUser = {
  username: 'username',
  password: 'password',
};

/**
 * Utility function used in some tests to register an user easily.
 * @param {Express} server the Server instance used in the test
 * @param {any} user credentials of the user
 * @return {Promise<EncryptedToken>} A promise containing the
 * Encrypted token for the newly registered user.
 * @see {@link testUser}
 */
export async function registerUser(
  server: Express,
  user: any,
): Promise<EncryptedToken> {
  return new Promise((resolve) => {
    supertest(server)
      .post('/user/register')
      .send(user)
      .expect(201)
      .then((res) => resolve(new EncryptedToken(res.body.token)));
  });
}
