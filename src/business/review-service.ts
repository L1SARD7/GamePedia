import type { Filter } from 'mongodb';
import type {
    CreateReviewDbModel,
    ReviewViewModel,
    UpdateReviewDbModel,
} from '../models/ReviewViewModel';
import { ReviewRepository } from '../repositories/review-db-repository';

export const reviewService = {
    async getReviews(gameId: string | null, authorId: string | null): Promise<ReviewViewModel[]> {
        const filter: Filter<ReviewViewModel> = {};
        if (gameId !== null) {
            filter.gameId = gameId;
        }
        if (authorId !== null) {
            filter.authorId = authorId;
        }
        return await ReviewRepository.findReviews(filter);
    },

    async getLatestGameReviews(gameId: string): Promise<ReviewViewModel[]> {
        return await ReviewRepository.findLatestReviewsByGameId(gameId);
    },

    async getReviewById(id: string): Promise<ReviewViewModel | null> {
        return await ReviewRepository.findReviewByReviewId(id);
    },

    async createNewReview(
        rating: number,
        text: string,
        gameId: string,
        authorId: string,
        authorName: string,
    ): Promise<ReviewViewModel> {
        const newReview: CreateReviewDbModel = {
            id: crypto.randomUUID(),
            gameId,
            authorId,
            authorName,
            rating,
            text,
            createdAt: new Date().toISOString(),
        };
        await ReviewRepository.createNewReview(newReview);
        return newReview;
    },

    async deleteReview(id: string): Promise<boolean> {
        return await ReviewRepository.deleteReview(id);
    },

    async deleteAllReviewsOfDeletedGame(id: string): Promise<boolean> {
        return await ReviewRepository.deleteAllReviewsOfDeletedGame(id);
    },

    async changeReview(
        reviewId: string,
        rating: number,
        text: string,
    ): Promise<ReviewViewModel | null> {
        const newData: UpdateReviewDbModel = {
            rating: rating,
            text: text,
        };
        const result = await ReviewRepository.changeReview(reviewId, newData);
        if (!result) {
            return null;
        }
        return await ReviewRepository.findReviewByReviewId(reviewId);
    },
};
