import { Router } from 'express';
import { RequestWithBody } from '../models/RequestTypes';
import { LoginInputModel } from '../models/LoginInputModel';
import {
    bodyLoginValidatorMiddleware,
    bodyPasswordValidatorMiddleware,
} from '../validator/LoginAndRegInputDataValidator';
import { validationResult } from 'express-validator';
import { HTTP_CODES } from '../utility';
import { UserService } from '../business/user-business-layer';
import { jwtService } from '../application/jwtService';

export const LoginRouter = Router({});

LoginRouter.get('/', (req, res) => {
    res.render('login');
});

LoginRouter.post(
    '/',
    bodyLoginValidatorMiddleware,
    bodyPasswordValidatorMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res) => {
        const validation = validationResult(req);
        if (validation.isEmpty()) {
            const user = await UserService.authorizationUser(req.body.login, req.body.password);
            if (user !== null) {
                if (user === 'unconfirmed email') {
                    res.render('login', {
                        errorMessage:
                            'Для входу в акаунт підвердіть свою електронну адресу. Підтвердження було надіслано на ваш email, вказаний при реєстрації',
                    });
                }
                if (user) {
                    // @ts-ignore
                    const token = await jwtService.createJWT(user);
                    // @ts-ignore
                    res.cookie('accessToken', token, {
                        httpOnly: true,
                    });
                    res.status(201).redirect('/profile');
                }
            } else {
                res.status(HTTP_CODES.BAD_REQUEST_400).render('login', {
                    errorMessage: 'Неправильний логін або пароль',
                });
            }
        } else {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
        }
    },
);
