import { Express } from "express"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"
import { hasValue } from "../core/utils/checks/valueChecks"

export default function setupServer(server: Express): void{
    dotenv.config()
    checkEnvironment()
    server.use(cors())
    server.use(bodyParser.json())
}

function checkEnvironment(): void{
    const port = process.env.PORT
    if(hasValue(port) || isNaN(Number(port)) || !Number.isInteger(Number(port)) || Number(port) < 0){
        throw new Error("There is something wrong with the PORT environment variable: " + port)
    }
    const tokenSecret = process.env.TOKEN_SECRET
    if(hasValue(tokenSecret) || tokenSecret === ""){
        throw new Error("There is something wrong with the TOKEN_SECRET environment variable: " + tokenSecret)
    }
    const encryptionSalt = process.env.ENCRYPTION_SALT
    if(hasValue(encryptionSalt) || encryptionSalt === ""){
        throw new Error("There is something wrong with the ENCRYPTION_SALT environment variable: " + encryptionSalt)
    }
}
