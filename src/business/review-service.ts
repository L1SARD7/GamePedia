import type { Filter } from 'mongodb';
import type {
    CreateReviewDbModel,
    ReviewViewModel,
    UpdateReviewDbModel,
} from '../models/ReviewViewModel';
import { ReviewRepository } from '../repositories/review-db-repository';

export const reviewService = {
    async GetReviews(gameId: string | null, authorId: string | null): Promise<ReviewViewModel[]> {
        const filter: Filter<ReviewViewModel> = {};
        if (gameId !== null) {
            filter.gameId = gameId;
        }
        if (authorId !== null) {
            filter.authorId = authorId;
        }
        return await ReviewRepository.FindReviews(filter);
    },

    async GetReviewById(id: string): Promise<ReviewViewModel | null> {
        return await ReviewRepository.FindReviewByReviewId(id);
    },

    async CreateNewReview(
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
        await ReviewRepository.CreateNewReview(newReview);
        return newReview;
    },

    async DeleteReview(id: string): Promise<boolean> {
        return await ReviewRepository.DeleteReview(id);
    },

    async DeleteAllReviewsOfDeletedGame(id: string): Promise<boolean> {
        return await ReviewRepository.DeleteAllReviewsOfDeletedGame(id);
    },

    async ChangeReview(
        reviewId: string,
        rating: number,
        text: string,
    ): Promise<ReviewViewModel | null> {
        const newData: UpdateReviewDbModel = {
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
