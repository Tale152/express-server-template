import jwt from 'jsonwebtoken';
import EnvVariablesSingleton from '../../../setup/EnvVariablesSingleton';
import {DecryptedToken, EncryptedToken} from '../../entities/Token';
import TokenGenerator from '../../interface_adapters/security/TokenGenerator';
import {isStringEmpty} from '../../utils/checks/stringChecks';

export default class JwtTokenGenerator implements TokenGenerator {
  private secret: string;
  private validity: string;

  constructor() {
    this.secret = EnvVariablesSingleton.instance.tokenSecret;
    this.validity = EnvVariablesSingleton.instance.tokenValidity;
  }

  encrypt(token: DecryptedToken): EncryptedToken {
    const tokenStr = jwt.sign(token.payload, this.secret, {
      expiresIn: this.validity,
    });
    return new EncryptedToken(tokenStr);
  }

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
