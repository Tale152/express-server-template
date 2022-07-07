import {isStringEmpty} from '../utils/checks/stringChecks';

export default class User {
  private constructor(private usr: string, private psw: string) {
    if (isStringEmpty(usr) || isStringEmpty(psw)) {
      throw new Error('Both username and password has to be valid. Username: ' + usr + ', Passoword: ' + psw);
    }
  }

  static createInstance(username: string, password: string) {
    return new User(username, password);
  }

  get username(): string {
    return this.usr;
  }

  get password(): string {
    return this.psw;
  }
}
