import * as bcrypt from 'bcrypt';
import EnvVariablesSingleton from '../../../setup/EnvVariablesSingleton';
import EncryptionHandler from '../../interface_adapters/security/EncryptionHandler';

/**
 * Concrete implementation of the EncryptionHandler inferface using the
 * bcrypt library.
 */
export default class BcryptEncryptionHandler implements EncryptionHandler {
  private salt: number = EnvVariablesSingleton.instance.encryptionSalt;

  /**
   * Encrypts a string using the hash function provided by bcrypt.
   * @param {string} str a string to encrypt
   * @return {Promise<string>} a promise wich, once solved, returns the
   * encrypted string
   */
  encrypt(str: string): Promise<string> {
    return bcrypt.hash(str, this.salt);
  }

  /**
   * Comares the actual data end the encrypted payload using the compare
   * function provided by bcrypt.
   * @param {string} data the correct data to compare to the encrypted
   * payload
   * @param {string} encrypted the encrypted payload to compare to the
   * correct data
   * @return {Promise<boolean>} a promise wich, once solved, returns
   * true if the comparison is successfull, false otherwise
   */
  compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
