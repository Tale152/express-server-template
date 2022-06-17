import Token from "../entities/Token"
import User from "../entities/User"
import { hasValue } from "../utils/checks/valueChecks"

export default class UserUseCases{

    private constructor(private persistence: UserPersistence){
        if(!hasValue(persistence)){
            throw new Error("The provided UserPersistence is " + persistence)
        }
    }

    static createInstance(persistence: UserPersistence){
        return new UserUseCases(persistence)
    }

    exists(username: string): boolean{
        return this.persistence.exists(username)
    }

    register(user: User): Token{
        return this.persistence.register(user)
    }

}
