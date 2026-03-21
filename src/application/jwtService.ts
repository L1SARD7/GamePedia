import jwt from 'jsonwebtoken';

const JWT_Secret = process.env.JWT_SECRET || '124';

export const jwtService = {
    async createJWT(user: any) {
        const payload = {
            id: user.id,
            username: user.username,
            userEmail: user.email,
            isAdmin: user.isAdmin,
        };

        console.log(JWT_Secret);
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
