import jwt from 'jsonwebtoken';
import { config } from '../config';

const JWT_Secret = config.JWT_SECRET;

export const jwtService = {
    async createJWT(user: any) {
        const payload = {
            id: user.id,
            username: user.username,
            userEmail: user.email,
            isAdmin: user.isAdmin,
        };
        const token = jwt.sign(payload, JWT_Secret, { expiresIn: '6h' });
        return token;
    },

    async getUserInfoByToken(token: string) {
        try {
            const user = jwt.verify(token, JWT_Secret);
            return user;
        } catch {
            return null;
        }
    },
};
