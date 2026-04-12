import type { Filter } from 'mongodb';
import { client } from '../db/db';
import type { ReviewViewModel } from '../models/ReviewViewModel';

export const ReviewRepository = {
    async findReviews(filter: Filter<ReviewViewModel>): Promise<ReviewViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .find(filter)
            .toArray();
    },

    async findReviewByUserId(id: string): Promise<ReviewViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .find({ authorId: id })
            .toArray();
    },

    async findReviewByReviewId(id: string): Promise<ReviewViewModel | null> {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .findOne({ id: id });
    },

    async findLatestReviewsByGameId(gameId: string): Promise<ReviewViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .find({ gameId })
            .sort({ createdAt: -1 })
            .toArray();
    },

    async createNewReview(newReview: ReviewViewModel) {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .insertOne(newReview);
    },

    async deleteReview(id: string): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .deleteOne({ id: id });
        return result.deletedCount === 1;
    },

    async deleteAllReviewsOfDeletedGame(id: string): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .deleteMany({ gameId: id });
        return result.acknowledged;
    },

    async changeReview(id: string, data: Partial<ReviewViewModel>): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .updateOne({ id: id }, { $set: data });
        return result.modifiedCount === 1;
    },
};
