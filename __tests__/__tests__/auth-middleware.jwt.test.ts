import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { authMiddleware } from '../../src/validator/auth-middleware';
import { jwtService } from '../../src/application/jwtService';

jest.mock('../../src/application/jwtService', () => ({
    jwtService: {
        getUserInfoByToken: jest.fn(),
    },
}));

describe('auth middleware tests (junior style)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createApp = () => {
        const app = express();
        app.use(cookieParser());
        app.get('/protected', authMiddleware, (req, res) => {
            res.status(200).json({ user: req.user ?? null });
        });
        return app;
    };

    it('should redirect to /login if there is no token', async () => {
        const app = createApp();

        const res = await request(app).get('/protected');

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/login');
    });

    it('should allow access when token is valid', async () => {
        const app = createApp();
        (jwtService.getUserInfoByToken as jest.Mock).mockResolvedValue({
            id: 'u-2',
            username: 'jwtUser',
            email: 'jwt@example.com',
            isAdmin: true,
        });

        const res = await request(app).get('/protected').set('Cookie', ['accessToken=valid-token']);

        expect(res.status).toBe(200);
        expect(jwtService.getUserInfoByToken).toHaveBeenCalledWith('valid-token');
        expect(res.body.user.username).toBe('jwtUser');
    });

    it('should clear cookie and redirect when token is invalid', async () => {
        const app = createApp();
        (jwtService.getUserInfoByToken as jest.Mock).mockResolvedValue(null);

        const res = await request(app).get('/protected').set('Cookie', ['accessToken=bad-token']);

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/login');
    });
});
