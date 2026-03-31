import { NextFunction, Request, Response } from 'express';

export const asyncErrorHandler = <T extends Request>(
    func: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req as T, res, next).catch((err) => next(err));
    };
};
