import {isStringEmpty} from '../utils/checks/stringChecks';

/**
 * Class representing an User that does not still have an ID because
 * it isn't saved on a persistent storage.
 * @see {@link User}
 */
export class UnpersistedUser {
  /**
   * @param {string} usr the username of the User
   * @param {string} psw the password of the User
   */
  constructor(private usr: string, private psw: string) {
    if (isStringEmpty(usr) || isStringEmpty(psw)) {
      throw new Error(
        'Both username and password has to be valid. Username: ' +
          usr +
          ', Password: ' +
          psw,
      );
    }
  }

  /**
   * Returns the username of the User.
   */
  get username(): string {
    return this.usr.trim();
  }

  /**
   * Returns the password of the User.
   */
  get password(): string {
    return this.psw;
  }
}

/**
 * Class representing an User that has an ID having already being
 * stored in a persistent storage.
 * @see {@link UnpersistedUser}
 */
export default class User extends UnpersistedUser {
  /**
   * @param {string} usrId the id of the User
   * @param {string} usr the username of the User
   * @param {string} psw the password of the User
   */
  constructor(private usrId: string, usr: string, psw: string) {
    super(usr, psw);
    if (isStringEmpty(usrId)) {
      throw new Error('ID has to be valid. Provided: ' + usrId);
    }
  }

  /**
   * Returns the id of the User.
   */
  get id(): string {
    return this.usrId;
  }
}
