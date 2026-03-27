export type ReviewViewModel = {
    id: number;
    gameId: number;
    authorId: number;
    authorName: string;
    rating: number;
    text: string;
};

export type CreateReviewDbModel = ReviewViewModel;
export type UpdateReviewDbModel = Partial<
    Omit<ReviewViewModel, 'id' | 'gameId' | 'authorId' | 'authorName'>
>;
