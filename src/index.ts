import mongoose from "mongoose"
import server from "./server"
import EnvVariablesSingleton from "./setup/EnvVariablesSingleton"

const envVariables = EnvVariablesSingleton.instance
mongoose
    .connect(envVariables.dbAddress)
    .then(async () => {
        console.log("Connection to DB succesful")
        server.listen(envVariables.port, () => {
            console.log("Server is listening on port " + envVariables.port)
        })
    })
    .catch(err => {
        console.log("Error connecting to DB at " + envVariables.dbAddress + ": " + err.message)
    })
