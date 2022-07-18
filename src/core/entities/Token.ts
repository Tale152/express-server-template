import {isStringEmpty} from '../utils/checks/stringChecks';

/**
 * A class representing a Token that has been encrypted by some encryption
 * algorithm.
 */
export class EncryptedToken {
  /**
   * @param {string} val the actual token string already encrypted by some
   * encryption algorithm.
   */
  constructor(private val: string) {
    if (isStringEmpty(val)) {
      throw new Error(
        'The value of the token has to be valid. Provided value: ' + val,
      );
    }
  }

  /**
   * @return {string} the token value
   */
  get value(): string {
    return this.val;
  }
}

/**
 * A class representing a Token that still hasn't been encrypted by some
 * encryption algorithm.
 */
export class DecryptedToken {
  /**
   * @param {string} usrId the ID of the User, contained in the Token
   */
  constructor(private usrId: string) {
    if (isStringEmpty(usrId)) {
      throw new Error(
        'The value of the id has to be valid. Provided id: ' + usrId,
      );
    }
  }

  /**
   * @return {string} the ID of the User, contained in the Token
   */
  get id(): string {
    return this.usrId.trim();
  }

  /**
   * @return {string} the content of the Token in the form of a javascript
   * object
   */
  get payload(): DecryptedTokenPayload {
    return {
      id: this.id,
    };
  }
}

interface DecryptedTokenPayload {
  id: string;
}
