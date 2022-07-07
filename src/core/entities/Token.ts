import {isStringEmpty} from '../utils/checks/stringChecks';

export class EncryptedToken {
  private constructor(private val: string) {
    if (isStringEmpty(val)) {
      throw new Error(
          'The value of the token has to be valid. Provided value: ' + val,
      );
    }
  }

  static createInstance(value: string) {
    return new EncryptedToken(value);
  }

  get value(): string {
    return this.val;
  }
}

export class DecryptedToken {
  private constructor(private usr: string) {
    if (isStringEmpty(usr)) {
      throw new Error(
          'The value of the username has to be valid. Provided value: ' + usr,
      );
    }
  }

  static createInstance(usr: string) {
    return new DecryptedToken(usr);
  }

  get username(): string {
    return this.usr;
  }

  get payload(): DecryptedTokenPayload {
    return {
      username: this.usr,
    };
  }
}

interface DecryptedTokenPayload {
  username: string;
}
