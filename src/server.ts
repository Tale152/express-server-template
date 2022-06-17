import express, { Express } from "express"

import setupServer from "./setup/setup"
import bindRoutes from "./routes/routes"

const server: Express = express()

setupServer(server)
bindRoutes(server)

server.listen(process.env.PORT, () => {
  console.log("Server is listening on port " + process.env.PORT)
})
