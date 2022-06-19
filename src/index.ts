import dotenv from "dotenv"
import mongoose from "mongoose"
import server from "./server"

dotenv.config()
if(process.env.DB_ADDRESS !== undefined){
    mongoose
    .connect(process.env.DB_ADDRESS)
    .then(async () => {
        console.log("Connection to DB succesful")
        server.listen(process.env.PORT, () => {
            console.log("Server is listening on port " + process.env.PORT)
        })
    })
    .catch(err => {
        console.log("Error connecting to DB at " + process.env.DB_ADDRESS + ": " + err.message)
    })
}
