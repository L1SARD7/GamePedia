import { param, query, body } from 'express-validator';

export const queryTitleValidatorMiddleware = query('title')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Title should be from 3 to 50 characters.');

export const queryGenreValidatorMiddleware = query('genre')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Genre should be from 3 to 50 characters.');

export const paramsIdValidatorMiddleware = param('id').isUUID().withMessage('Incorrect ID format.');

export const gameDataInputValidatorMiddleware = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title should be from 3 to 100 characters.'),
    body('genre')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Genre should be from 3 to 50 characters.'),
    body('release_year').isInt({ min: 1970, max: 2030 }).withMessage('Incorrect release year.'),
    body('developer')
        .trim()
        .isLength({ min: 3, max: 40 })
        .withMessage('Name of developer should be from 3 to 40 characters.'),
    body('description')
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description should be max 2000 characters.'),
    body('imageURL')
        .trim()
        .isURL()
        .withMessage('Image URL should be a valid URL.')
        .isLength({ max: 300 }),
    body('trailerYoutubeId')
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('Trailer YouTube ID should be from 5 to 20 characters.'),
    body('bannerURL')
        .trim()
        .isURL()
        .withMessage('Banner URL should be a valid URL.')
        .isLength({ max: 300 }),
];
