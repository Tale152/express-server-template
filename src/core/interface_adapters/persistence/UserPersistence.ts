import User, {UnpersistedUser} from '../../entities/User';

export default interface UserPersistence {
  exists: (username: string) => Promise<boolean>;

  createNew: (user: UnpersistedUser) => Promise<boolean>;

  getByUsername: (username: string) => Promise<User | undefined>;

  getById: (id: string) => Promise<User | undefined>;
}
