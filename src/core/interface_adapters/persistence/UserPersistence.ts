import User from "../../entities/User"

export default interface UserPersistence {

    exists: (username: string) => boolean

    register: (user: User) => void

    login: (user: User) => void

}
