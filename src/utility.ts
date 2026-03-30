import { Request, Response, NextFunction } from 'express';

export const HTTP_CODES = {
    OK_200: 200,
    CREATED_201: 201,
    DELETED_204: 204,
    BAD_REQUEST_400: 400,
    UNAUTHORIZED_401: 401,
    FORBIDDEN_403: 403,
    NOT_FOUND_404: 404,
    CONFLICT_409: 409,
    INTERNAL_SERVER_ERROR_500: 500,
};

type AsyncController = (req: any, res: Response, next: NextFunction) => Promise<any>;

export const catchAsync = (fn: AsyncController) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
