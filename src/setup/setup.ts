import { Express } from "express"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"

export default function setupServer(server: Express): void{
    dotenv.config()
    checkEnvironment()
    server.use(cors())
    server.use(bodyParser.json())
}

function checkEnvironment(): void{
    const port = process.env.PORT
    if(port === undefined || port === null || isNaN(Number(port)) || !Number.isInteger(Number(port)) || Number(port) < 0){
        throw new Error("There is something wrong with the PORT environment variable: " + port)
    }
}
