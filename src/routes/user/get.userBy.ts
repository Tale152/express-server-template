import { Request, Response } from "express"

import User from "../../core/entities/User"
import UserUseCases from "../../core/use_cases/UserUseCases"

export default function userGetByHandler(userUseCases: UserUseCases): (req: Request, res: Response) => Promise<void>{
    return async (req: Request, res: Response) => {
        const id = req.query.id
        if(typeof id === "string" && id.trim() !== ""){
            userUseCases.getById(
                id.trim(),
                onFound(res), 
                onNotFound(res), 
                onError(res)
            )
        } else {
            res.status(400).send()
        }  
    }
}

function onFound(res: Response): (user: User) => Promise<void>{
    return async (user: User) => {
        res.status(200)
            .json({username: user.username})
            .send()
    }
}

function onNotFound(res: Response): () => Promise<void>{
    return async () => {
        res.status(204).send()
    }
}

function onError(res: Response): () => Promise<void>{
    return async () => {
        res.status(500).send()
    }
}
