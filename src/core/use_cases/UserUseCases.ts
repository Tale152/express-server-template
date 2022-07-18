import {
  EncryptedToken,
  DecryptedToken,
} from '../entities/Token';
import User, {UnpersistedUser} from '../entities/User';
import EncryptionHandler from '../interface_adapters/security/EncryptionHandler';
import UserPersistence from '../interface_adapters/persistence/UserPersistence';
import TokenGenerator from '../interface_adapters/security/TokenGenerator';

/**
 * Use cases revolving around an User.
 */
export default class UserUseCases {
  /**
   * @param {UserPersistence} persistence concrete implementation of
   * UserPersistence which handles the persistence and retrieval of
   * Users
   * @param {TokenGenerator} tokenGenerator concrete implementation of
   * TokenGenerator, handling the generation and decryption of Tokens
   * for authenticating the User while accessing some routes.
   * @param {EncryptionHandler} encryptionHandler concrete implementation
   * of EncryptionHandler, handling the encryption of passwords
   */
  constructor(
    private persistence: UserPersistence,
    private tokenGenerator: TokenGenerator,
    private encryptionHandler: EncryptionHandler,
  ) {
    // does nothing
  }

  /**
   * Use case for registering an User.
   * @param {UnpersistedUser} user to persist
   * @param {function(): void} onUserAlreadyExists callback invoked when
   * the provided User already exists
   * @param {function(EncryptedToken): void} onSuccess callback invoked
   * when the registration is completed with success
   * @param {function(): void} onError callback invoked when an error
   * arises while trying to satisfy the request
   */
  register(
    user: UnpersistedUser,
    onUserAlreadyExists: () => void,
    onSuccess: (token: EncryptedToken) => void,
    onError: () => void,
  ): void {
    this.persistence.exists(user.username).then((userAlreadyExists) => {
      if (userAlreadyExists) {
        onUserAlreadyExists();
      } else {
        encryptUser(user, this.encryptionHandler).then(
          (encryptedUser) => {
            this.persistence.createNew(encryptedUser).then(
              () => {
                const decryptedToken = new DecryptedToken(
                  encryptedUser.username,
                );
                onSuccess(this.tokenGenerator.encrypt(decryptedToken));
              },
              () => onError(),
            );
          },
          () => onError(),
        );
      }
    }, onError);
  }

  /**
   * Use case for the login of an User.
   * @param {UnpersistedUser} user the User that wants to login
   * @param {function():void} onInvalidCredentials callback invoked
   * when the credentials contained in the provided User are not
   * valid to perform a login to any persisted User
   * @param {function(EncryptedToken): void} onSuccess callback
   * invoked when the login attempt is successful
   * @param {function():void} onError callback invoked when an error
   * arises duing the login attempt
   */
  login(
    user: UnpersistedUser,
    onInvalidCredentials: () => void,
    onSuccess: (token: EncryptedToken) => void,
    onError: () => void,
  ): void {
    this.persistence.getByUsername(user.username).then((retreivedUser) => {
      if (retreivedUser === undefined) {
        onInvalidCredentials();
      } else {
        this.encryptionHandler
          .compare(user.password, retreivedUser.password)
          .then(
            (comparationResult) => {
              if (comparationResult) {
                const decryptedToken = new DecryptedToken(retreivedUser.id);
                onSuccess(this.tokenGenerator.encrypt(decryptedToken));
              } else {
                onInvalidCredentials();
              }
            },
            () => onError(),
          );
      }
    }, onError);
  }

  /**
   * Use case for retieving a persisted User by providing its ID.
   * @param {string} id the id of the User to find
   * @param {function(User):void} onFound callback invoked when the
   * User is successfully found
   * @param {function(): void} onNotFound callback invoked when no
   * User is found using the provided ID
   * @param {function(): void} onError callback invoked when an error
   * arises during the research process
   */
  getById(
    id: string,
    onFound: (user: User) => void,
    onNotFound: () => void,
    onError: () => void,
  ): void {
    this.persistence.getById(id).then((retrievedUser) => {
      retrievedUser === undefined ? onNotFound() : onFound(retrievedUser);
    }, onError);
  }

  /**
   * Use case for retieving a persisted User by providing its username.
   * @param {string} username the username of the User to find
   * @param {function(User):void} onFound callback invoked when the
   * User is successfully found
   * @param {function(): void} onNotFound callback invoked when no
   * User is found using the provided ID
   * @param {function(): void} onError callback invoked when an error
   * arises during the research process
   */
  getByUsername(
    username: string,
    onFound: (user: User) => void,
    onNotFound: () => void,
    onError: () => void,
  ): void {
    this.persistence.getByUsername(username).then((retrievedUser) => {
      retrievedUser === undefined ? onNotFound() : onFound(retrievedUser);
    }, onError);
  }
}

/**
 * Utility function that takes an UnpersistedUser and encrypt
 * its password by using the EncryptionHandler.
 * @param {UnpersistedUser} user the User which password will
 * be encrypted
 * @param {EncryptionHandler} encryptionHandler the concrete
 * instance of an EncryptionHandler to perform the encryption
 * @return {Promise<UnpersistedUser>} a promise wich, once solved,
 * contains the new UnpersistedUser with its password encrypted
 */
async function encryptUser(
  user: UnpersistedUser,
  encryptionHandler: EncryptionHandler,
): Promise<UnpersistedUser> {
  return new UnpersistedUser(
    user.username,
    await encryptionHandler.encrypt(user.password),
  );
}
