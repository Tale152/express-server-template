import User from "../../entities/User"

export default interface UserPersistence {

    exists: (username: string) => Promise<boolean>

    createNew: (user: User) => Promise<void>

    getByUsername: (username: string) => Promise<User>

}
