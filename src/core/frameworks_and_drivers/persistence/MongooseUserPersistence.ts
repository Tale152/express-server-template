import User, {UnpersistedUser} from '../../entities/User';
import UserPersistence from '../../interface_adapters/persistence/UserPersistence';
import UserModel from './mongoose/UserModel';

const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Concrete implementation of the UserPersistence interface using the Mongoose
 * library.
 */
export default class MongooseUserPersistence implements UserPersistence {
  /**
   * Checks if an User with the provided username exists.
   * @param {string} username the username of the User that its being searched
   * @return {Promise<boolean>} a promise returning true if an User with the
   * provided username is found, false otherwise
   */
  exists(username: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.getByUsername(username).then((user) => resolve(user !== undefined));
    });
  }

  /**
   * Creates a new User on the MongoDB collection.
   * @param {UnpersistedUser} user the UnpersistedUser to be persisted
   * @return {Promise<boolean>} a promise that returns true if the User
   * creation was successful, false otherwise
   */
  createNew(user: UnpersistedUser): Promise<boolean> {
    const userToPersist = new UserModel({
      username: user.username,
      password: user.password,
    });
    return new Promise((resolve) => {
      userToPersist.save((err) => {
        err ? resolve(false) : resolve(true);
      });
    });
  }

  /**
   * Searches for a persisted User using the provided username.
   * @param {string} username the username used to search for a
   * persisted User
   * @return {Promise<User | undefined>} a promise which returns
   * an User that matches the provided username; undefined if no user
   * is found
   */
  getByUsername(username: string): Promise<User | undefined> {
    return new Promise((resolve) => {
      UserModel.findOne({username: username}).then(async (user) => {
        user !== null ?
          resolve(new User(user._id.toString(), user.username, user.password)) :
          resolve(undefined);
      });
    });
  }

  /**
   * Searches for a persisted User using the provided ID.
   * @param {string} id the ID used to search for a persisted User
   * @return {Promise<User | undefined>} a promise which returns
   * an User that matches the provided ID; undefined if no user is found
   */
  getById(id: string): Promise<User | undefined> {
    return new Promise((resolve) => {
      if (ObjectId.isValid(id)) {
        UserModel.findById(id).then(async (user) => {
          user !== null ?
            resolve(
              new User(user._id.toString(), user.username, user.password),
            ) :
            resolve(undefined);
        });
      } else {
        resolve(undefined);
      }
    });
  }
}
