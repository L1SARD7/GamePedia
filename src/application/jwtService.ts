import { UserViewModel } from "../models/UserViewModel";
import jwt from "jsonwebtoken"
import { JWT_Secret } from "../utility";


export const jwtService = {
    async createJWT (user: UserViewModel) {
        const token = jwt.sign({userId: user.id}, JWT_Secret, {expiresIn: '6h'})
        return token
    },

    
}