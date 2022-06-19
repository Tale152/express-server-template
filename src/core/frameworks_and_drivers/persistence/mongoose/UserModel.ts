import { Schema, model } from "mongoose"

interface IUser {
    username: string
    password: string
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: true }
})

const UserModel = model<IUser>('User', userSchema)

export default UserModel