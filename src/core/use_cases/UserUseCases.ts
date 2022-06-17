import Token from "../entities/Token"
import User from "../entities/User"
import UserPersistence from "../interface_adapters/persistence/UserPersistence"
import TokenGenerator from "../interface_adapters/TokenGenerator"
import { hasValue } from "../utils/checks/valueChecks"

export default class UserUseCases{

    private constructor(private persistence: UserPersistence, private tokenGenerator: TokenGenerator){
        if(!hasValue(persistence)){
            throw new Error("The provided UserPersistence is " + persistence)
        }
        if(!hasValue(tokenGenerator)){
            throw new Error("The provided TokenGenerator is " + tokenGenerator)
        }
    }

    static createInstance(persistence: UserPersistence, tokenGenerator: TokenGenerator){
        return new UserUseCases(persistence, tokenGenerator)
    }

    exists(username: string): boolean{
        return this.persistence.exists(username)
    }

    register(user: User): Token{
        this.persistence.register(user)
        return Token.createInstance(this.tokenGenerator.generate(user.username))
    }

    login(user: User): Token{
        this.persistence.login(user)
        return Token.createInstance(this.tokenGenerator.generate(user.username))
    }

}
