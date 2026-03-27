import { Filter } from 'mongodb';
import { client } from '../db/db';
import { ReviewViewModel } from '../models/ReviewViewModel';

export const ReviewRepository = {
    async FindReviews(filter: Filter<ReviewViewModel>): Promise<ReviewViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .find(filter)
            .toArray();
    },

    async FindReviewByUserId(id: number): Promise<ReviewViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .find({ authorId: id })
            .toArray();
    },

    async FindReviewByReviewId(id: number): Promise<ReviewViewModel | null> {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .findOne({ id: id });
    },

    async CreateNewReview(newReview: ReviewViewModel) {
        return await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .insertOne(newReview);
    },

    async DeleteReview(id: number): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .deleteOne({ id: id });
        return result.deletedCount === 1;
    },

    async DeleteAllReviewsOfDeletedGame(id: number): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .deleteMany({ gameId: id });
        return result.acknowledged;
    },

    async ChangeReview(id: number, data: Partial<ReviewViewModel>): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<ReviewViewModel>('reviews')
            .updateOne({ id: id }, { $set: data });
        return result.modifiedCount === 1;
    },
};
