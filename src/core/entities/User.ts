import {isStringEmpty} from '../utils/checks/stringChecks';

export class UnpersistedUser {
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

  get username(): string {
    return this.usr.trim();
  }

  get password(): string {
    return this.psw.trim();
  }
}

export default class User extends UnpersistedUser {
  constructor(private usrId: string, usr: string, psw: string) {
    super(usr, psw);
    if (isStringEmpty(usrId)) {
      throw new Error('ID has to be valid. Provided: ' + usrId);
    }
  }

  get id(): string {
    return this.usrId.trim();
  }
}
