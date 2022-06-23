import express, { Express } from "express"

import { setupServer } from "./setup/setup"
import bindRoutes from "./routes/routes"

const server: Express = express()

setupServer(server)
bindRoutes(server)

export default server
