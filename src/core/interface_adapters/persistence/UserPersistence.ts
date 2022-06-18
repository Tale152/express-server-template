import User from "../../entities/User"

export default interface UserPersistence {

    exists: (username: string) => boolean

    createNew: (user: User) => void

    getByUsername: (username: string) => User | undefined

}
