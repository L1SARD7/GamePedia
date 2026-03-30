import { Request, Response, NextFunction } from 'express';
import { HTTP_CODES } from '../utility';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Сталася помилка:', err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || HTTP_CODES.INTERNAL_SERVER_ERROR_500;
    const message = err.message || 'Щось пішло не так. Внутрішня помилка сервера.';

    if (req.accepts('json') && !req.accepts('html')) {
        res.status(statusCode).json({
            success: false,
            message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
        return;
    }

    res.status(statusCode).render('error', {
        error: message,
    });
};
