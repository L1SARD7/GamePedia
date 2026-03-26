import { ReviewViewModel } from '../models/ReviewViewModel';
import { ReviewRepository } from '../repositories/review-db-repository';

export const reviewService = {
    async GetReviews(gameId: number | null, authorId: number | null) {
        const filter: any = {};
        if (gameId) {
            filter.gameId = gameId;
        }
        if (authorId) {
            filter.authorId = authorId;
        }
        return await ReviewRepository.FindReviews(filter);
    },

    async GetReviewById(id: number) {
        return await ReviewRepository.FindReviewByReviewId(id);
    },

    async CreateNewReview(
        rating: number,
        text: string,
        gameId: number,
        authorId: number,
        authorName: string,
    ): Promise<any> {
        const newReview: ReviewViewModel = {
            id: +new Date(),
            gameId: gameId,
            authorId: authorId,
            authorName: authorName,
            rating: rating,
            text: text,
        };
        await ReviewRepository.CreateNewReview(newReview);
        return newReview;
    },

    async DeleteReview(id: number) {
        return await ReviewRepository.DeleteReview(id);
    },

    async DeleteAllReviewsOfDeletedGame(id: number) {
        return await ReviewRepository.DeleteAllReviewsOfDeletedGame(id);
    },

    async ChangeReview(reviewId: number, rating: number, text: string): Promise<any> {
        const newData = {
            rating: rating,
            text: text,
        };
        const result = await ReviewRepository.ChangeReview(reviewId, newData);
        if (!result) {
            return null;
        }
        return await ReviewRepository.FindReviewByReviewId(reviewId);
    },
};
