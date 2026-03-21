import { body } from 'express-validator';

export const bodyLoginValidatorMiddleware = body('login')
    .trim()
    .isLength({ min: 3, max: 15 })
    .withMessage('Login should be from 3 to 15 letters.');
export const bodyPasswordValidatorMiddleware = body('password')
    .trim()
    .isLength({ min: 3, max: 15 })
    .withMessage('Password should be from 3 to 15 letters.');
export const bodyemailValidatorMiddleware = body('email')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Email should be from 3 to 30 letters.');
