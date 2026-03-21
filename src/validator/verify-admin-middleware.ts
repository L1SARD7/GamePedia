import { NextFunction, Request, Response } from 'express';

export const verifyAdmin = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction,
) => {
    if (req.user?.isAdmin === true) {
        next();
        return;
    }
    res.status(403).send('Ви не маєте доступу до цих дій.');
};
