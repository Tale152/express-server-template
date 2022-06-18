import { Request, Response } from "express"

import Token from "../../core/entities/Token"
import User from "../../core/entities/User"
import UserUseCases from "../../core/use_cases/UserUseCases"
import { isStringEmpty } from "../../core/utils/checks/stringChecks"

export default function userLoginHandler(userUseCases: UserUseCases): (req: Request, res: Response) => Promise<void>{
    return async (req: Request, res: Response) => {
        const username = req.body.username
        const password = req.body.password
        if(areParametersValid(username, password)){
            userUseCases.login(
                User.createInstance(username, password),
                onInvalidCredentials(res), 
                onSuccess(res), 
                onError(res)
            )
        } else {
            res.status(400).send()
        }  
    }
}

function areParametersValid(username: string, password: string): boolean{
    return !isStringEmpty(username) && !isStringEmpty(password)
}

function onInvalidCredentials(res: Response): () => Promise<void>{
    return async () => {
        res.status(401).send()
    }
}

function onSuccess(res: Response): (token: Token) => Promise<void>{
    return async (token: Token) => {
        res.status(200).json({token: token}).send()
    }
}

function onError(res: Response): () => Promise<void>{
    return async () => {
        res.status(500).send()
    }
}
