export type GameViewModel = {
    id: string;
    title: string;
    genre: string;
    release_year: number;
    developer: string;
    description: string;
    imageURL: string;
    trailerYoutubeId: string;
    bannerURL: string;
    avgRating: number | null;
};

export type CreateGameDbModel = GameViewModel;
export type UpdateGameDbModel = Partial<Omit<GameViewModel, 'id'>>;
