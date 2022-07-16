import {isStringEmpty} from '../utils/checks/stringChecks';

export class EncryptedToken {
  constructor(private val: string) {
    if (isStringEmpty(val)) {
      throw new Error(
        'The value of the token has to be valid. Provided value: ' + val,
      );
    }
  }

  get value(): string {
    return this.val;
  }
}

export class DecryptedToken {
  constructor(private usrId: string) {
    if (isStringEmpty(usrId)) {
      throw new Error(
        'The value of the id has to be valid. Provided id: ' + usrId,
      );
    }
  }

  get id(): string {
    return this.usrId.trim();
  }

  get payload(): DecryptedTokenPayload {
    return {
      id: this.id,
    };
  }
}

interface DecryptedTokenPayload {
  id: string;
}
