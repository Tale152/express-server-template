import * as bcrypt from "bcrypt"
import EncryptionHandler from "../../interface_adapters/security/EncryptionHandler"

export default class BcryptEncryptionHandler implements EncryptionHandler{

    encrypt(str: string): Promise<string>{
        return bcrypt.hash(str, process.env.ENCRYPTION_SALT !== undefined ? process.env.ENCRYPTION_SALT : "")
    }

    compare(data: string, encrypted: string): Promise<boolean>{
        return bcrypt.compare(data, encrypted)
    }
    
}