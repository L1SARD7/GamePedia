import { UserViewModel } from "../models/UserViewModel";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_Secret } from "../utility";


export const jwtService = {
    async createJWT (user: any) {
        const payload = {
            userId: user.id, 
            username: user.username,
            userEmail: user.email,
            isAdmin: user.isAdmin
        }
        
        const token = jwt.sign(payload, JWT_Secret, {expiresIn: '6h'})
        return token
    },

    async getUserInfoByToken (token: string) {
        const user = jwt.verify(token, JWT_Secret)
        return user
    }
}