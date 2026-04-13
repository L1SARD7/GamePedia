import type { Request, Response } from 'express';
import { Router } from 'express';
import type { RequestWithBody } from '../models/RequestTypes';
import type { LoginInputModel } from '../models/LoginInputModel';
import {
    bodyLoginValidatorMiddleware,
    bodyPasswordValidatorMiddleware,
} from '../validator/LoginAndRegInputDataValidator';
import { validationResult } from 'express-validator';
import { HTTP_CODES } from '../utility';
import { UserService } from '../business/user-service';
import { jwtService } from '../application/jwtService';
import { config } from '../config';
import { asyncErrorHandler } from '../validator/async-error-handler';
import { authLimiter } from '../validator/rate-limit-middleware';

export const LoginRouter = Router({});

LoginRouter.get('/', (req: Request, res: Response) => {
    res.status(HTTP_CODES.OK_200).render('login');
});

LoginRouter.post(
    '/',
    authLimiter,
    bodyLoginValidatorMiddleware,
    bodyPasswordValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithBody<LoginInputModel>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const user = await UserService.authorizationUser(req.body.login, req.body.password);
        if (user === null) {
            res.status(HTTP_CODES.BAD_REQUEST_400).render('login', {
                errorMessage: 'Неправильний логін або пароль',
            });
            return;
        }
        if (user === 'unconfirmed email') {
            res.status(HTTP_CODES.FORBIDDEN_403).render('login', {
                errorMessage:
                    'Для входу в акаунт підвердіть свою електронну адресу. Підтвердження було надіслано на ваш email, вказаний при реєстрації',
            });
            return;
        }
        const token = await jwtService.createJWT(user);
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: config.TOKEN_EXPIRATION_TIME,
        });
        res.redirect('/profile');
    }),
);
