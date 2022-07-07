import dotenv from 'dotenv';

export default class EnvVariablesSingleton {
  private static inst: EnvVariablesSingleton | undefined = undefined;
  private envPort: number;
  private db: string;
  private salt: number;
  private secret: string;
  private validity: string;

  private constructor() {
    dotenv.config();

    if (process.env.PORT !== undefined && !isNaN(parseInt(process.env.PORT))) {
      this.envPort = parseInt(process.env.PORT);
    } else {
      throw Error('There is something wrong with the environment variable PORT: ' + process.env.PORT);
    }
    if (process.env.DB_ADDRESS !== undefined && typeof process.env.DB_ADDRESS === 'string') {
      this.db = process.env.DB_ADDRESS;
    } else {
      throw Error('There is something wrong with the environment variable DB_ADDRESS: ' + process.env.DB_ADDRESS);
    }
    if (process.env.ENCRYPTION_SALT !== undefined && !isNaN(parseInt(process.env.ENCRYPTION_SALT))) {
      this.salt = parseInt(process.env.ENCRYPTION_SALT);
    } else {
      throw Error('There is something wrong with the environment variable ENCRYPTION_SALT: ' + process.env.ENCRYPTION_SALT);
    }
    if (process.env.TOKEN_SECRET !== undefined && typeof process.env.TOKEN_SECRET === 'string') {
      this.secret = process.env.TOKEN_SECRET;
    } else {
      throw Error('There is something wrong with the environment variable TOKEN_SECRET: ' + process.env.TOKEN_SECRET);
    }
    if (process.env.TOKEN_VALIDITY !== undefined && typeof process.env.TOKEN_VALIDITY === 'string') {
      this.validity = process.env.TOKEN_VALIDITY;
    } else {
      throw Error('There is something wrong with the environment variable TOKEN_VALIDITY: ' + process.env.TOKEN_VALIDITY);
    }
  }

  static get instance(): EnvVariablesSingleton {
    if (EnvVariablesSingleton.inst === undefined) {
      EnvVariablesSingleton.inst = new EnvVariablesSingleton();
    }
    return EnvVariablesSingleton.inst;
  }

  get port(): number {
    return this.envPort;
  }

  get dbAddress(): string {
    return this.db;
  }

  get encryptionSalt(): number {
    return this.salt;
  }

  get tokenSecret(): string {
    return this.secret;
  }

  get tokenValidity(): string {
    return this.validity;
  }
}
