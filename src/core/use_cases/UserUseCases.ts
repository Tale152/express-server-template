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

    register(user: User, onUserAlreadyExists: () => void, onSuccess: (token: Token) => void, onError: () => void): void {
        this.persistence.exists(user.username).then(userAlreadyExists => {
            if(userAlreadyExists){
                onUserAlreadyExists()
            } else {
                encryptUser(user, this.encryptionHandler).then(encryptedUser => {
                    this.persistence.createNew(encryptedUser).then(() => {
                        onSuccess(Token.createInstance(this.tokenGenerator.generate(user.username)))
                    }, () => onError())
                }, () => onError())
            }
        }, () => onError())
    }

    login(user: User, onInvalidCredentials: () => void, onSuccess: (token: Token) => void, onError: () => void): void {
        this.persistence.getByUsername(user.username).then(retreivedUser => {
            if(retreivedUser === undefined){
                onInvalidCredentials()
            } else {
                this.encryptionHandler.compare(user.password, retreivedUser.password).then(comparationResult => {
                    comparationResult ? onSuccess(Token.createInstance(this.tokenGenerator.generate(user.username))) : onInvalidCredentials()
                }, () => onError())
            }
        }, () => onError())
    }

}

async function encryptUser(user: User, encryptionHandler: EncryptionHandler): Promise<User> {
    return User.createInstance(user.username, await encryptionHandler.encrypt(user.password))
}
