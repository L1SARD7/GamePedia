import type { Response } from 'express';
import { Router } from 'express';
import type {
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery,
} from '../models/RequestTypes';
import { validationResult } from 'express-validator';
import { HTTP_CODES } from '../utility';
import {
    bodyRatingReviewValidatorMiddleware,
    bodyTextReviewValidatorMiddleware,
} from '../validator/ReviewInputDataValidator';
import type { ReviewInputModel } from '../models/ReviewInputModel';
import { reviewService } from '../business/review-service';
import type { URIParamsId } from '../models/URIParamsId';
import { paramsIdValidatorMiddleware } from '../validator/GamesInputDataValidator';
import { gamesService } from '../business/games-service';
import { authMiddleware } from '../validator/auth-middleware';
import { asyncErrorHandler } from '../validator/async-error-handler';

export const ReviewRouter = Router({});

ReviewRouter.get(
    '/',
    asyncErrorHandler(
        async (req: RequestWithQuery<{ gameId: string; authorId: string }>, res: Response) => {
            if (!req.query.gameId && !req.query.authorId) {
                res.status(HTTP_CODES.BAD_REQUEST_400).json({
                    error: 'Bad Request',
                    message: 'Missing required query parameters: gameId or authorId',
                });
                return;
            }
            const SortedReviews = await reviewService.getReviews(
                req.query.gameId,
                req.query.authorId,
            );
            res.status(HTTP_CODES.OK_200).json(SortedReviews);
        },
    ),
);

ReviewRouter.post(
    '/:id',
    authMiddleware,
    bodyRatingReviewValidatorMiddleware,
    bodyTextReviewValidatorMiddleware,
    asyncErrorHandler(
        async (req: RequestWithParamsAndBody<URIParamsId, ReviewInputModel>, res: Response) => {
            const validation = validationResult(req);
            if (!validation.isEmpty()) {
                res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
                return;
            }
            if (!req.user) {
                res.status(HTTP_CODES.UNAUTHORIZED_401).send(
                    'Щоб залишити відгук, потрібно бути авторизованим',
                );
                return;
            }
            const isAlreadyCreated = await reviewService.getReviews(req.params.id, req.user.id);
            if (isAlreadyCreated.length !== 0) {
                res.status(HTTP_CODES.CONFLICT_409).send('В вас вже є залишений відгук цій грі.');
                return;
            }
            const CreatedReview = await reviewService.createNewReview(
                +req.body.rating,
                req.body.text,
                req.params.id,
                req.user.id,
                req.user.username,
            );
            if (!CreatedReview) {
                res.status(HTTP_CODES.BAD_REQUEST_400).redirect(`/`);
                return;
            }
            await gamesService.updateAvgRating(req.params.id);
            res.redirect(`/games/${req.params.id}`);
        },
    ),
);

ReviewRouter.delete(
    '/:id',
    authMiddleware,
    paramsIdValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithParams<URIParamsId>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const isExist = await reviewService.getReviewById(req.params.id);
        if (!isExist) {
            res.status(HTTP_CODES.NOT_FOUND_404).send('Такого відгуку не існує.');
            return;
        }
        if (req.user?.id !== isExist.authorId) {
            res.status(HTTP_CODES.FORBIDDEN_403).send('Ви не маєте права видалити чужий відгук.');
            return;
        }
        const isDeleted = await reviewService.deleteReview(req.params.id);
        if (!isDeleted) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR_500).send(
                'Не вдалося видалити відгук. Спробуйте пізніше.',
            );
            return;
        }
        await gamesService.updateAvgRating(isExist.gameId);
        res.redirect(req.body.returnTo);
    }),
);

ReviewRouter.put(
    '/:id',
    authMiddleware,
    bodyRatingReviewValidatorMiddleware,
    bodyTextReviewValidatorMiddleware,
    asyncErrorHandler(
        async (req: RequestWithParamsAndBody<URIParamsId, ReviewInputModel>, res: Response) => {
            const validation = validationResult(req);
            if (!validation.isEmpty()) {
                res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
                return;
            }
            const isExist = await reviewService.getReviewById(req.params.id);
            if (!req.user) {
                res.status(HTTP_CODES.UNAUTHORIZED_401).send(
                    'Для того, щоб залишити відгук, необхідно бути авторизованим.',
                );
                return;
            }
            if (!isExist) {
                res.status(HTTP_CODES.NOT_FOUND_404).send('Відгук не знайдено.');
                return;
            }
            if (req.user?.id !== isExist.authorId) {
                res.status(HTTP_CODES.FORBIDDEN_403).send(
                    'Ви не маєте права редагувати чужий відгук.',
                );
                return;
            }
            const changedReview = await reviewService.changeReview(
                req.params.id,
                +req.body.rating,
                req.body.text,
            );
            if (!changedReview) {
                res.status(HTTP_CODES.INTERNAL_SERVER_ERROR_500).send(
                    'Не вдалося оновити відгук. Перевірте дані та спробуйте ще раз.',
                );
                return;
            }
            await gamesService.updateAvgRating(isExist.gameId);
            res.redirect(req.body.returnTo);
        },
    ),
);
