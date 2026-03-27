import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../application/jwtService';

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    if (req.user) {
        next();
        return;
    }

    if (!req.cookies.accessToken) {
        res.redirect('/login');
        return;
    }

    const userInfo = await jwtService.getUserInfoByToken(req.cookies.accessToken);
    if (userInfo) {
        req.user = userInfo;
        next();
        return;
    }
    res.clearCookie('accessToken');
    res.redirect('/login');
};
