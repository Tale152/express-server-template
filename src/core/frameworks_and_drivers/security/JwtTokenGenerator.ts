import jwt from "jsonwebtoken"
import EnvVariablesSingleton from "../../../setup/EnvVariablesSingleton"
import TokenGenerator from "../../interface_adapters/security/TokenGenerator"

export default class JwtTokenGenerator implements TokenGenerator{

    private secret: string

    private constructor(){
        this.secret = EnvVariablesSingleton.instance.tokenSecret
    }

    static createInstance(){
        return new JwtTokenGenerator()
    }

    generate(str: string): string{
        return jwt.sign(str, this.secret)
    }
    
}
