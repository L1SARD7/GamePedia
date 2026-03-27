import { Request, Response, Router } from 'express';
import { reviewService } from '../business/review-business-layer';
import { gamesService } from '../business/games-business-layer';
import { authMiddleware } from '../validator/auth-middleware';
import { HTTP_CODES } from '../utility';

export const ProfileRouter = Router({});

ProfileRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    const ReviewsMadedByUser = await reviewService.GetReviews(null, req.user.id);
    const gameIds = [...new Set(ReviewsMadedByUser.map((r) => r.gameId))];
    const games = await gamesService.GetManyGamesByID(gameIds);
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
});

ProfileRouter.post('/logout', async (req: Request, res: Response) => {
    res.clearCookie('accessToken');
    res.redirect('/');
});
