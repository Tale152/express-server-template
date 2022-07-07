import dotenv from 'dotenv';

/**
 * Singleton used to access environment variables in a type-safe way,
 * throwing error if one or more environment variables are not defined
 * or defined incorrectly.
 */
export default class EnvVariablesSingleton {
  private static inst: EnvVariablesSingleton | undefined = undefined;
  private envPort: number;
  private db: string;
  private salt: number;
  private secret: string;
  private validity: string;

  /**
   * Private constructor, only exposing the static instance getter following
   * singleton pattern. Here the variables are initialized using private
   * handlers specific for the expected type of variable.
   * @throws if one or more environment variables are not defined
   * or defined incorrectly.
   */
  private constructor() {
    dotenv.config();
    this.envPort = this.getNum(process.env.PORT, 'PORT');
    this.db = this.getStr(process.env.DB_ADDRESS, 'DB_ADDRESS');
    this.salt = this.getNum(process.env.ENCRYPTION_SALT, 'ENCRYPTION_SALT');
    this.secret = this.getStr(process.env.TOKEN_SECRET, 'TOKEN_SECRET');
    this.validity = this.getStr(process.env.TOKEN_VALIDITY, 'TOKEN_VALIDITY');
  }

  /**
   * Executes checks on the specified string environment variable.
   * @param {string | undefined} v the value of the environment variable
   * @param {string} name the name to display in the error message should
   * the variable be not defined or defined incorrectly
   * @return {string} the type-safe string environment variable
   * @throws if v is undefined, not a string or an empty string
   */
  private getStr(v: string | undefined, name: string): string {
    if (v !== undefined && typeof v === 'string' && v.trim() !== '') {
      return v.trim();
    }
    throw Error(this.errorString(v, name));
  }

  /**
   * Executes checks on the specified numeric environment variable.
   * @param {string | undefined} v the value of the environment variable
   * @param {string} name the name to display in the error message should
   * the variable be not defined or defined incorrectly
   * @return {number} the type-safe numeric environment variable
   * @throws if v is undefined or not a number
   */
  private getNum(v: string | undefined, name: string): number {
    if (v !== undefined && !isNaN(parseInt(v))) {
      return parseInt(v);
    }
    throw Error(this.errorString(v, name));
  }

  /**
   * String that will be displayed in the error message should
   * the variable be not defined or defined incorrectly.
   * @param {string | undefined} v the value of the environment variable
   * @param {string} name the name of the variable
   * @return {string} the string created using the provided arguments
   */
  private errorString(v: string | undefined, name: string): string {
    return (
      'Something is wrong with the environment variable ' + name + ': ' + v
    );
  }

  /**
   * Static getter used to access the instance following
   * the singleton pattern.
   * @return {EnvVariablesSingleton} the singleton instance
   * @throws if one or more environment variables are not defined
   * or defined incorrectly.
   */
  static get instance(): EnvVariablesSingleton {
    if (EnvVariablesSingleton.inst === undefined) {
      EnvVariablesSingleton.inst = new EnvVariablesSingleton();
    }
    return EnvVariablesSingleton.inst;
  }

  /**
   * @return {number} the type-safe value of the PORT environment variable
   */
  get port(): number {
    return this.envPort;
  }

  /**
   * @return {string} the type-safe value of the DB_ADDRESS environment variable
   */
  get dbAddress(): string {
    return this.db;
  }

  /**
   * @return {number} the type-safe value of the ENCRYPTION_SALT
   * environment variable
   */
  get encryptionSalt(): number {
    return this.salt;
  }

  /**
   * @return {string} the type-safe value of the TOKEN_SECRET
   * environment variable
   */
  get tokenSecret(): string {
    return this.secret;
  }

  /**
   * @return {string} the type-safe value of the TOKEN_VALIDITY
   * environment variable
   */
  get tokenValidity(): string {
    return this.validity;
  }
}
