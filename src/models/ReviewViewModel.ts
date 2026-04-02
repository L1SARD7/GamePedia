export type ReviewViewModel = {
    id: string;
    gameId: string;
    authorId: string;
    authorName: string;
    rating: number;
    text: string;
    createdAt: string;
};

export type CreateReviewDbModel = ReviewViewModel;
export type UpdateReviewDbModel = Partial<
    Omit<ReviewViewModel, 'id' | 'gameId' | 'authorId' | 'authorName' | 'createdAt'>
>;
