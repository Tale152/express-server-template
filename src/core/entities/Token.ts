import { isStringEmpty } from "../utils/checks/stringChecks"

export default class Token{

    private constructor(private val: string){
        if(isStringEmpty(val)){
            throw new Error("The value of the token has to be valid. Provided value: " + val)
        }
    }

    static createInstance(value: string){
        return new Token(value)
    }

    get value(): string {
        return this.val
    }

}
