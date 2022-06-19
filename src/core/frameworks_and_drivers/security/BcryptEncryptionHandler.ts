import * as bcrypt from "bcrypt"
import EncryptionHandler from "../../interface_adapters/security/EncryptionHandler"

export default class BcryptEncryptionHandler implements EncryptionHandler{

    private constructor(){}

    static createInstance(): BcryptEncryptionHandler{
        return new BcryptEncryptionHandler()
    }

    encrypt(str: string): Promise<string>{
        return bcrypt.hash(str, process.env.ENCRYPTION_SALT !== undefined ? parseInt(process.env.ENCRYPTION_SALT) : 10)
    }

    compare(data: string, encrypted: string): Promise<boolean>{
        return bcrypt.compare(data, encrypted)
    }
    
}