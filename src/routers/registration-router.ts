import type { Request, Response } from 'express';
import { Router } from 'express';
import type { RequestWithBody, RequestWithParamsAndQuery } from '../models/RequestTypes';
import {
    bodyemailValidatorMiddleware,
    bodyLoginValidatorMiddleware,
    bodyPasswordValidatorMiddleware,
} from '../validator/LoginAndRegInputDataValidator';
import { validationResult } from 'express-validator';
import { HTTP_CODES } from '../utility';
import { UserRepository } from '../repositories/user-db-repository';
import type { RegistrationInputModel } from '../models/RegistrationInputModel';
import { UserService } from '../business/user-service';
import { asyncErrorHandler } from '../validator/async-error-handler';

export const RegistrationRouter = Router({});

RegistrationRouter.get(
    '/confirmEmail/:confirmationCode',
    asyncErrorHandler(
        async (
            req: RequestWithParamsAndQuery<{ confirmationCode: string }, { userId: string }>,
            res: Response,
        ) => {
            const result = await UserService.confirmEmail(
                req.query.userId,
                req.params.confirmationCode,
            );
            if (!result) {
                res.status(400).send('Невірний або прострочений код підтвердження');
                return;
            }
            res.redirect('/login');
        },
    ),
);

RegistrationRouter.get('/', (req: Request, res: Response) => {
    res.status(HTTP_CODES.OK_200).render('registration');
});

RegistrationRouter.post(
    '/',
    bodyLoginValidatorMiddleware,
    bodyemailValidatorMiddleware,
    bodyPasswordValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithBody<RegistrationInputModel>, res: Response) => {
        const validation = validationResult(req);
        const formData = {
            login: req.body.login,
            email: req.body.email,
        };
        if (!validation.isEmpty()) {
            return res.status(HTTP_CODES.BAD_REQUEST_400).render('registration', {
                errors: validation.mapped(),
                formData: formData,
            });
        }
        if (req.body.password !== req.body.repeatPassword) {
            return res.status(HTTP_CODES.BAD_REQUEST_400).render('registration', {
                errors: { repeatPassword: { msg: 'Паролі не співпадають' } },
                formData: formData,
            });
        }

        const exist = await UserRepository.findUserByLogin(req.body.login);
        if (exist) {
            return res.status(HTTP_CODES.BAD_REQUEST_400).render('registration', {
                errors: { login: { msg: 'Користувач з таким логіном вже існує' } },
                formData: formData,
            });
        }
        const CreatedUser = await UserService.createNewUser(
            req.body.login,
            req.body.email,
            req.body.password,
        );
        if (!CreatedUser) {
            return res.status(HTTP_CODES.BAD_REQUEST_400).render('registration', {
                globalError: 'Сталася помилка при створенні акаунту. Спробуйте пізніше.',
                formData: formData,
            });
        }
        res.status(HTTP_CODES.CREATED_201).render('registration', {
            successMessage:
                'Акаунт успішно створений, щоб активувати його перейдіть за посиланням, яке було надіслано на вашу електонну пошту.',
        });
    }),
);
