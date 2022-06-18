import jwt from "jsonwebtoken"
import TokenGenerator from "../../interface_adapters/security/TokenGenerator"

export default class JwtTokenGenerator implements TokenGenerator{

    private constructor(){}

    static createInstance(){
        return new JwtTokenGenerator()
    }

    generate(str: string): string{
        //token presence gets checked when launching server so it's impossible for it to be undefined but the check has to be performed to make Typescript happy
        return jwt.sign(str, process.env.TOKEN_SECRET !== undefined ? process.env.TOKEN_SECRET : "")
    }
    
}
