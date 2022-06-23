import * as bcrypt from "bcrypt"
import EnvVariablesSingleton from "../../../setup/EnvVariablesSingleton"
import EncryptionHandler from "../../interface_adapters/security/EncryptionHandler"

export default class BcryptEncryptionHandler implements EncryptionHandler{

    private salt: number

    private constructor(){
        this.salt = EnvVariablesSingleton.instance.encryptionSalt
    }

    static createInstance(): BcryptEncryptionHandler{
        return new BcryptEncryptionHandler()
    }

    encrypt(str: string): Promise<string>{
        return bcrypt.hash(str, this.salt)
    }

    compare(data: string, encrypted: string): Promise<boolean>{
        return bcrypt.compare(data, encrypted)
    }
    
}