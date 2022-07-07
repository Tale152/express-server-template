import User from '../../entities/User';
import UserPersistence from '../../interface_adapters/persistence/UserPersistence';
import UserModel from './mongoose/UserModel';

export default class MongooseUserPersistence implements UserPersistence {
  private constructor() {}

  static createInstance(): MongooseUserPersistence {
    return new MongooseUserPersistence();
  }

  exists(username: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.getByUsername(username).then((user) => resolve(user !== undefined));
    });
  }

  createNew(user: User): Promise<boolean> {
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

  getByUsername(username: string): Promise<User|undefined> {
    return new Promise((resolve) => {
      UserModel.findOne({username: username}).then(async (user) => {
                user !== null ? resolve(User.createInstance(user.username, user.password)) : resolve(undefined);
      });
    });
  }

  getById(id: string): Promise<User|undefined> {
    return new Promise((resolve) => {
      UserModel.findById(id).then(async (user) => {
                user !== null ? resolve(User.createInstance(user.username, user.password)) : resolve(undefined);
      });
    });
  }
}
