import { Router } from 'express';
import { reviewService } from '../business/review-business-layer';
import { gamesService } from '../business/games-business-layer';
import { authMiddleware } from '../validator/auth-middleware';

export const ProfileRouter = Router({});

ProfileRouter.get('/', authMiddleware, async (req, res) => {
    // @ts-ignore
    if (req.user) {
        // @ts-ignore
        const ReviewsMadedByUser = (await reviewService.GetReviews(null, req.user.id)) || [];
        const gameIds = [...new Set(ReviewsMadedByUser.map((r) => r.gameId))];
        const games = await gamesService.GetManyGamesByID(gameIds);

        const userReviews = ReviewsMadedByUser.map((review) => {
            const game = games.find((g) => g.id === review.gameId);
            return {
                ...review,
                // @ts-ignore
                gameTitle: game.title,
            };
        });
        // @ts-ignore
        res.render('profile', { user: req.user, myReviews: userReviews });
    } else res.redirect('/login');
});

ProfileRouter.post('/logout', async (req, res) => {
    res.clearCookie('accessToken');
    res.redirect('/');
});
