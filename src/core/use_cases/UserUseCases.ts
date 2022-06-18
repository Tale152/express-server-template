import Token from "../entities/Token"
import User from "../entities/User"
import EncryptionHandler from "../interface_adapters/security/EncryptionHandler"
import UserPersistence from "../interface_adapters/persistence/UserPersistence"
import TokenGenerator from "../interface_adapters/security/TokenGenerator"
import { hasValue } from "../utils/checks/valueChecks"

export default class UserUseCases {

    private constructor(private persistence: UserPersistence, private tokenGenerator: TokenGenerator, private encryptionHandler: EncryptionHandler) {
        if(!hasValue(persistence) || !hasValue(tokenGenerator) || !hasValue(encryptionHandler)){
            throw new Error("At least one of the provided arguments is undefined or null")
        }
    }

    static createInstance(persistence: UserPersistence, tokenGenerator: TokenGenerator, encryptionHandler: EncryptionHandler) {
        return new UserUseCases(persistence, tokenGenerator, encryptionHandler)
    }

    register(user: User): Token | undefined {
        if(this.persistence.exists(user.username)){
            return undefined
        } else {
            this.persistence.createNew(this.encryptUser(user))
            return Token.createInstance(this.tokenGenerator.generate(user.username))
        }
    }

    login(user: User): Token | undefined {
        var persistedUser: User | undefined = this.persistence.getByUsername(user.username)
        if(persistedUser === undefined){
            return undefined
        } else {
            return this.encryptionHandler.compare(user.password, persistedUser.password) ? Token.createInstance(this.tokenGenerator.generate(user.username)) : undefined
        }
    }

    private encryptUser(user: User): User {
        return User.createInstance(user.username, this.encryptionHandler.encrypt(user.password))
    }

}
