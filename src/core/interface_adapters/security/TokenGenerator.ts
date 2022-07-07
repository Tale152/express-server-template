import {EncryptedToken, DecryptedToken} from '../../entities/Token';

export default interface TokenGenerator {
  encrypt: (token: DecryptedToken) => EncryptedToken;

  decode: (token: EncryptedToken) => DecryptedToken | undefined;
}
