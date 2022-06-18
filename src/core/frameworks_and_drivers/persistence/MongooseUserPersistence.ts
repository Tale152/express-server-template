import User from "../../entities/User"
import UserPersistence from "../../interface_adapters/persistence/UserPersistence"

export default class MongooseUserPersistence implements UserPersistence{
    
    private constructor(){}

    static createInstance(): MongooseUserPersistence{
        return new MongooseUserPersistence()
    }

    exists(username: string): Promise<boolean>{
        //TODO
    }

    createNew(user: User): Promise<void>{
        //TODO
    }

    getByUsername(username: string): Promise<User>{
        //TODO
    }
    
}