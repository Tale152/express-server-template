import jwt from 'jsonwebtoken';
import EnvVariablesSingleton from '../../../setup/EnvVariablesSingleton';
import {DecryptedToken, EncryptedToken} from '../../entities/Token';
import TokenGenerator from '../../interface_adapters/security/TokenGenerator';
import {isStringEmpty} from '../../utils/checks/stringChecks';

/**
* Concrete implementation of the TokenGenerator interface using
* the jsonwebtoken library.
*/
export default class JwtTokenGenerator implements TokenGenerator {
  private secret: string = EnvVariablesSingleton.instance.tokenSecret;
  private validity: string = EnvVariablesSingleton.instance.tokenValidity;

  /**
   * Encrypts a DecryptedToken using the sign function of jwt.
   * @param {DecryptedToken} token a DecryptedToken to encrypt
   * @return {EncryptedToken} the newly encrypted token
   */
  encrypt(token: DecryptedToken): EncryptedToken {
    const tokenStr = jwt.sign(token.payload, this.secret, {
      expiresIn: this.validity,
    });
    return new EncryptedToken(tokenStr);
  }

  /**
   * Decrypts an EncryptedToken using the verify function of jwt.
   * @param {EncryptedToken} token a an EncryptedToken to decrypt
   * @return {DecryptedToken | undefined} the newly decrypted token,
   * undefined if something went wrong while decrypting
   */
  decode(token: EncryptedToken): DecryptedToken | undefined {
    try {
      const decoded = jwt.verify(token.value, this.secret);
      if (typeof decoded !== 'string') {
        const id = decoded.id;
        if (typeof id === 'string' && !isStringEmpty(id)) {
          return new DecryptedToken(id);
        }
      }
      return undefined;
    } catch (ex) {
      return undefined;
    }
  }
}
