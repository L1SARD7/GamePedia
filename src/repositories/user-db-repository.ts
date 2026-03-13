import { client} from "../db/db"
import { UserDbModel } from "../models/UserDbViewModel"
import { UserViewModel } from "../models/UserViewModel"

export const UserRepository = {
    async FindUserByLogin (login: string) {
        return await client.db("GamePedia").collection("users").findOne({login: login})
    },

    async findUserById (id: number) : Promise<UserDbModel | null> {
        return await client.db("GamePedia").collection("users").findOne({id: id}) as UserDbModel | null
    },

    async CreateNewUser (newUser: UserViewModel) {
       return await client.db("GamePedia").collection("users").insertOne(newUser)
    },

    async updateEmailConfirmationStatus (userId: number) {
        const result = await client.db("GamePedia").collection("users").updateOne({id: userId}, {$set : {"emailVerification.isConfirmed": true}})
        return result.modifiedCount === 1
    }
}