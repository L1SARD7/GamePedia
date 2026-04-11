import { body } from 'express-validator';

export const bodyLoginValidatorMiddleware = body('login')
    .trim()
    .isLength({ min: 3, max: 15 })
    .withMessage('Login should be from 3 to 15 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Login can contain only letters, numbers, and underscore.');

export const bodyPasswordValidatorMiddleware = body('password')
    .trim()
    .isLength({ min: 6, max: 30 })
    .withMessage('Password should be from 6 to 30 characters.');

export const bodyemailValidatorMiddleware = body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .isLength({ max: 100 })
    .withMessage('Email should be no more than 100 characters.');
