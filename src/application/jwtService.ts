import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserInfoModel } from '../models/UserViewModel';
import { JwtPayload } from '../models/AuthModel';

const JWT_Secret = config.JWT_SECRET;

export const jwtService = {
    async createJWT(user: UserInfoModel): Promise<string> {
        const payload: JwtPayload = {
            id: user.id,
            username: user.username,
            userEmail: user.email,
            isAdmin: user.isAdmin,
        };
        const token = jwt.sign(payload, JWT_Secret, { expiresIn: '6h' });
        return token;
    },

    async getUserInfoByToken(token: string): Promise<UserInfoModel | null> {
        try {
            const user = jwt.verify(token, JWT_Secret) as JwtPayload;
            return {
                id: user.id,
                username: user.username,
                email: user.userEmail,
                isAdmin: user.isAdmin,
            };
        } catch {
            return null;
        }
    },
};
