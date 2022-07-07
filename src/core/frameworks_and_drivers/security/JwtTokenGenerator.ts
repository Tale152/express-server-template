import jwt from 'jsonwebtoken';
import EnvVariablesSingleton from '../../../setup/EnvVariablesSingleton';
import {DecryptedToken, EncryptedToken} from '../../entities/Token';
import TokenGenerator from '../../interface_adapters/security/TokenGenerator';
import {isStringEmpty} from '../../utils/checks/stringChecks';

export default class JwtTokenGenerator implements TokenGenerator {
  private secret: string;

  private constructor() {
    this.secret = EnvVariablesSingleton.instance.tokenSecret;
  }

  static createInstance() {
    return new JwtTokenGenerator();
  }

  encrypt(token: DecryptedToken): EncryptedToken {
    const tokenStr = jwt.sign(token.payload, this.secret, {
      expiresIn: EnvVariablesSingleton.instance.tokenValidity,
    });
    return EncryptedToken.createInstance(tokenStr);
  }

  decode(token: EncryptedToken): DecryptedToken | undefined {
    try {
      const decoded = jwt.verify(token.value, this.secret);
      if (
        typeof decoded !== 'string' &&
        decoded.exp !== undefined &&
        decoded.exp * 1000 > new Date().getTime()
      ) {
        const username = decoded.username;
        if (typeof username === 'string' && !isStringEmpty(username)) {
          return DecryptedToken.createInstance(username);
        }
      }
      return undefined;
    } catch (ex) {
      return undefined;
    }
  }
}
