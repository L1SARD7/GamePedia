import type { Request, Response } from 'express';
import { Router } from 'express';
import { reviewService } from '../business/review-service';
import { gamesService } from '../business/games-service';
import { authMiddleware } from '../validator/auth-middleware';
import { HTTP_CODES } from '../utility';
import { asyncErrorHandler } from '../validator/async-error-handler';

export const ProfileRouter = Router({});

ProfileRouter.get(
    '/',
    authMiddleware,
    asyncErrorHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        const ReviewsMadedByUser = await reviewService.getReviews(null, req.user.id);
        const gameIds = [...new Set(ReviewsMadedByUser.map((r) => r.gameId))];
        const games = await gamesService.getManyGamesByID(gameIds);
        const userReviews = ReviewsMadedByUser.map((review) => {
            const game = games.find((g) => g.id === review.gameId);
            if (!game) {
                return;
            }
            return {
                ...review,
                gameTitle: game.title,
            };
        });
        res.status(HTTP_CODES.OK_200).render('profile', { user: req.user, myReviews: userReviews });
    }),
);

ProfileRouter.post(
    '/logout',
    asyncErrorHandler(async (req: Request, res: Response) => {
        res.clearCookie('accessToken');
        res.redirect('/');
    }),
);
