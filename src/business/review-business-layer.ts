import { Filter } from 'mongodb';
import {
    CreateReviewDbModel,
    ReviewViewModel,
    UpdateReviewDbModel,
} from '../models/ReviewViewModel';
import { ReviewRepository } from '../repositories/review-db-repository';

export const reviewService = {
    async GetReviews(gameId: number | null, authorId: number | null): Promise<ReviewViewModel[]> {
        const filter: Filter<ReviewViewModel> = {};
        if (gameId !== null) {
            filter.gameId = gameId;
        }
        if (authorId !== null) {
            filter.authorId = authorId;
        }
        return await ReviewRepository.FindReviews(filter);
    },

    async GetReviewById(id: number): Promise<ReviewViewModel | null> {
        return await ReviewRepository.FindReviewByReviewId(id);
    },

    async CreateNewReview(
        rating: number,
        text: string,
        gameId: number,
        authorId: number,
        authorName: string,
    ): Promise<ReviewViewModel> {
        const newReview: CreateReviewDbModel = {
            id: +new Date(),
            gameId,
            authorId,
            authorName,
            rating,
            text,
        };
        await ReviewRepository.CreateNewReview(newReview);
        return newReview;
    },

    async DeleteReview(id: number): Promise<boolean> {
        return await ReviewRepository.DeleteReview(id);
    },

    async DeleteAllReviewsOfDeletedGame(id: number): Promise<boolean> {
        return await ReviewRepository.DeleteAllReviewsOfDeletedGame(id);
    },

    async ChangeReview(
        reviewId: number,
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
