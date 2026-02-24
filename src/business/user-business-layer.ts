import { UserViewModel } from "../models/UserViewModel"
import { UserRepository } from "../repositories/user-db-repository"
import bcrypt from "bcrypt"

const SaltRounds = 10

export const UserService = {
    async CreateNewUser (login: string, email: string, password: string) : Promise<any> {
        const passwordHash = await this.encodePassword(password)    
        let newUser = {
            id: +(new Date()),
            login: login,
            email: email,
            passwordHash: passwordHash,
            isAdmin: false
            }
        await UserRepository.CreateNewUser(newUser)
        let CreatedUser = await UserRepository.FindUserByLogin(newUser.login)
        return CreatedUser
    },

    async authorizationUser (login: string, password: string) {
        const user = await UserRepository.FindUserByLogin(login)
        if (user) {
            const vereficationResult = await this.checkCredentials(password, user.passwordHash)
            if (vereficationResult) {
                const authorizatedUser = {
                    id: user.id, username: user.login, email: user.email, isAdmin: user.isAdmin
                }
                return authorizatedUser
            } else null
        } 
        else {
            return null
        }
    },

    async encodePassword (password: string, ) {
        const salt = await bcrypt.genSalt(SaltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        return passwordHash;
    },
    
    async checkCredentials (enteredPassword: string, hash: string) {
        return await bcrypt.compare(enteredPassword, hash)
    }
}