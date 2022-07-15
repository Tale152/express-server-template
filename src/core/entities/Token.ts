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
  private constructor(private usrId: string) {
    if (isStringEmpty(usrId)) {
      throw new Error(
        'The value of the id has to be valid. Provided id: ' + usrId,
      );
    }
  }

  static createInstance(usr: string) {
    return new DecryptedToken(usr.trim());
  }

  get id(): string {
    return this.usrId;
  }

  get payload(): DecryptedTokenPayload {
    return {
      id: this.usrId,
    };
  }
}

interface DecryptedTokenPayload {
  id: string;
}
