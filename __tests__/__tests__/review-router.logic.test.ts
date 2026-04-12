import express from 'express';
import request from 'supertest';
import { ReviewRouter } from '../../src/routers/review-router';
import { reviewService } from '../../src/business/review-service';
import { gamesService } from '../../src/business/games-service';

jest.mock('../../src/business/review-service', () => ({
    reviewService: {
        getReviews: jest.fn(),
        createNewReview: jest.fn(),
        getReviewById: jest.fn(),
        changeReview: jest.fn(),
        deleteReview: jest.fn(),
    },
}));

jest.mock('../../src/business/games-service', () => ({
    gamesService: {
        updateAvgRating: jest.fn(),
    },
}));

jest.mock('../../src/validator/auth-middleware', () => ({
    authMiddleware: (req: any, _res: any, next: any) => {
        const userHeader = req.headers['x-test-user'];
        req.user = userHeader ? JSON.parse(userHeader) : undefined;
        next();
    },
}));

describe('review router tests (junior style)', () => {
    const createApp = () => {
        const app = express();
        app.use(express.json());
        app.use('/review', ReviewRouter);
        return app;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 when gameId and authorId are missing', async () => {
        const app = createApp();

        const res = await request(app).get('/review');

        expect(res.status).toBe(400);
    });

    it('should block duplicate review from same user for same game', async () => {
        const app = createApp();
        (reviewService.getReviews as jest.Mock).mockResolvedValueOnce([{ id: 'existing' }]);

        const res = await request(app)
            .post('/review/game-1')
            .set(
                'x-test-user',
                JSON.stringify({
                    id: 'author-1',
                    username: 'test-author',
                    email: 'author@example.com',
                    isAdmin: false,
                }),
            )
            .send({ rating: 9, text: 'duplicate review' });

        expect(res.status).toBe(409);
        expect(reviewService.createNewReview).not.toHaveBeenCalled();
    });

    it('should create review and update game avg rating', async () => {
        const app = createApp();
        (reviewService.getReviews as jest.Mock).mockResolvedValueOnce([]);
        (reviewService.createNewReview as jest.Mock).mockResolvedValue({ id: 'new-review-id' });
        (gamesService.updateAvgRating as jest.Mock).mockResolvedValue(true);

        const res = await request(app)
            .post('/review/game-2')
            .set(
                'x-test-user',
                JSON.stringify({
                    id: 'author-2',
                    username: 'new-author',
                    email: 'new@author.com',
                    isAdmin: false,
                }),
            )
            .send({ rating: 8, text: 'good game' });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/games/game-2');
        expect(gamesService.updateAvgRating).toHaveBeenCalledWith('game-2');
    });

    it('should not allow editing someone else review', async () => {
        const app = createApp();
        (reviewService.getReviewById as jest.Mock).mockResolvedValue({
            id: 'review-44',
            authorId: 'another-user',
            gameId: 'game-44',
        });

        const res = await request(app)
            .put('/review/review-44')
            .set(
                'x-test-user',
                JSON.stringify({
                    id: 'my-id',
                    username: 'me',
                    email: 'me@test.com',
                    isAdmin: false,
                }),
            )
            .send({ rating: 10, text: 'Edited', returnTo: '/games/game-44' });

        expect(res.status).toBe(403);
    });

    it('should delete own review and redirect back', async () => {
        const app = createApp();
        (reviewService.getReviewById as jest.Mock).mockResolvedValue({
            id: 'review-55',
            gameId: 'game-55',
            authorId: 'author-55',
        });
        (reviewService.deleteReview as jest.Mock).mockResolvedValue(true);
        (gamesService.updateAvgRating as jest.Mock).mockResolvedValue(true);

        const res = await request(app)
            .delete('/review/review-55')
            .set(
                'x-test-user',
                JSON.stringify({
                    id: 'author-55',
                    username: 'author55',
                    email: 'author55@example.com',
                    isAdmin: false,
                }),
            )
            .send({ returnTo: '/games/game-55' });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/games/game-55');
    });
});
