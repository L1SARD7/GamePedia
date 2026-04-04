import { config } from '../config';
import type { IgdbGameViewModel, MappedIgdbGame, TokenResponseModel } from '../models/IgdbModels';
import { igdbTokenRepository } from '../repositories/token-db-repository';

const buildIgdbImageUrl = (url: string | undefined, size: string): string => {
    if (!url) {
        return '';
    }
    return `https:${url.replace('t_thumb', size)}`;
};

const mapIgdbToGameModel = (game: IgdbGameViewModel): MappedIgdbGame => {
    return {
        title: game.name,
        genre: game.genres ? game.genres.map((g) => g.name).join(', ') : null,
        release_year: game.first_release_date
            ? new Date(game.first_release_date * 1000).getFullYear()
            : null,
        developer:
            game.involved_companies?.find((c) => c.company?.name)?.company?.name ?? 'Unknown',
        description: game.summary ?? ' ',
        imageURL: buildIgdbImageUrl(game.cover?.url, 't_cover_big'),
        trailerYoutubeId: game.videos?.[0]?.video_id ?? '',
        bannerURL: buildIgdbImageUrl(game.artworks?.[0]?.url, 't_screenshot_huge'),
    };
};

export const igdbApiAdapter = {
    async getAccessToken(): Promise<string | null> {
        const savedToken = await igdbTokenRepository.getToken();
        if (savedToken && savedToken.expiresAt && Date.now() < savedToken.expiresAt) {
            return savedToken.accessToken;
        }
        try {
            const response = await fetch(
                `https://id.twitch.tv/oauth2/token?client_id=${config.IGDB.CLIENT_ID}&client_secret=${config.IGDB.CLIENT_SECRET}&grant_type=client_credentials`,
                {
                    method: 'POST',
                },
            );
            if (!response.ok) {
                throw new Error('Помилка авторизації в Twitch API');
            }
            const data: TokenResponseModel = await response.json();
            const accessToken = data.access_token;
            const expiresAt = Date.now() + data.expires_in * 1000;
            await igdbTokenRepository.saveToken(data.access_token, expiresAt);
            return accessToken;
        } catch {
            throw new Error('Unable to get Twitch access token for IGDB');
        }
    },

    async getGameInfoByTitle(title: string) {
        const accessToken = await this.getAccessToken();
        try {
            const response = await fetch('https://api.igdb.com/v4/games', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Client-ID': config.IGDB.CLIENT_ID,
                    Authorization: `Bearer ${accessToken}`,
                },
                body: `search "${title}";
                fields name,genres.name,first_release_date,involved_companies.company.name,summary,cover.url,videos.video_id,artworks.url;
                limit 10;`,
            });
            if (!response.ok) {
                throw new Error('Помилка запиту до бази ігор IGDB');
            }
            const results = (await response.json()) as IgdbGameViewModel[];
            return results.map(mapIgdbToGameModel);
        } catch {
            throw new Error('Unable to fetch game info from IGDB');
        }
    },
};
