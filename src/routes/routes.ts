import { Express } from "express"
import MongooseUserPersistence from "../core/frameworks_and_drivers/persistence/MongooseUserPersistence"
import BcryptEncryptionHandler from "../core/frameworks_and_drivers/security/BcryptEncryptionHandler"
import JwtTokenGenerator from "../core/frameworks_and_drivers/security/JwtTokenGenerator"
import UserUseCases from "../core/use_cases/UserUseCases"
import userRegisterHandler from "./user/post.register"
import userLoginHandler from "./user/get.login"

const tokenGenerator = JwtTokenGenerator.createInstance()
const encryptionHandler = BcryptEncryptionHandler.createInstance()
const userPersistence = MongooseUserPersistence.createInstance()
const userUseCases = UserUseCases.createInstance(userPersistence, tokenGenerator, encryptionHandler)

export default function bindRoutes(server: Express): void{

    server.post("/user/register", userRegisterHandler(userUseCases))

    server.post("/user/login", userLoginHandler(userUseCases))

}
