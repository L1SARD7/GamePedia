export type IgdbTokenDbModel = {
    key: string;
    accessToken: string;
    expiresAt: number;
};

export type TokenResponseModel = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

export type IgdbGameViewModel = {
    name: string;
    genres?: Array<{ name?: string }>;
    first_release_date?: number;
    involved_companies?: Array<{ company?: { name?: string } }>;
    summary?: string;
    cover?: { url?: string };
    videos?: Array<{ video_id?: string }>;
    artworks?: Array<{ url?: string }>;
};

export type MappedIgdbGame = {
    title: string;
    genre: string | null;
    release_year: number | null;
    developer: string;
    description: string;
    imageURL: string;
    trailerYoutubeId: string | null;
    bannerURL: string;
};
