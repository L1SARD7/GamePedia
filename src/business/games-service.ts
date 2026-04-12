import type { Filter, Sort } from 'mongodb';
import type { CreateGameDbModel, GameViewModel, UpdateGameDbModel } from '../models/GameViewModel';
import { GamesRepository } from '../repositories/games-db-repository';
import { reviewService } from './review-service';
import { igdbApiAdapter } from '../adapters/igdb-api-adapter';
import type { MappedIgdbGame } from '../models/IgdbModels';

export const gamesService = {
    async getGamesByFilter(title: string | null, genre: string | null): Promise<GameViewModel[]> {
        const filter: Filter<GameViewModel> = {};
        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }
        if (genre) {
            filter.genre = genre;
        }
        return await GamesRepository.getGames(filter);
    },

    async findGamesByTitle(title: string): Promise<GameViewModel[]> {
        return await GamesRepository.findGamesByTitle(title);
    },

    async getAllGames(): Promise<GameViewModel[]> {
        return await GamesRepository.getAllGames();
    },

    async getManyGamesByID(gameIds: string[]): Promise<GameViewModel[]> {
        return await GamesRepository.getManyGamesByID(gameIds);
    },

    async getGameByID(id: string): Promise<GameViewModel | null> {
        return await GamesRepository.getGameByID(id);
    },

    async getLatestGames(): Promise<GameViewModel[]> {
        const sortMethod: Sort = { createdAt: -1 };
        return await GamesRepository.getSortedGames(sortMethod);
    },

    async getTopRatedGames(): Promise<GameViewModel[]> {
        const sortMethod: Sort = { avgRating: -1 };
        return await GamesRepository.getSortedGames(sortMethod);
    },

    async deleteGame(id: string): Promise<boolean> {
        return await GamesRepository.deleteGame(id);
    },

    async searchGameByIgdb(title: string): Promise<MappedIgdbGame[]> {
        return await igdbApiAdapter.getGameInfoByTitle(title);
    },

    async createNewGame(
        title: string,
        genre: string,
        release_year: number,
        developer: string,
        description: string,
        imageURL: string,
        trailerYoutubeId: string,
        bannerURL: string,
    ): Promise<GameViewModel | null> {
        const newGame: CreateGameDbModel = {
            id: crypto.randomUUID(),
            title,
            genre,
            release_year,
            developer,
            description,
            imageURL,
            trailerYoutubeId,
            bannerURL,
            createdAt: new Date().toISOString(),
            avgRating: null,
        };
        await GamesRepository.createNewGame(newGame);
        return await GamesRepository.getGameByID(newGame.id);
    },

    async updateGame(
        id: string,
        title: string,
        genre: string,
        release_year: number,
        developer: string,
        description: string,
        imageURL: string,
        trailerYoutubeId: string,
        bannerURL: string,
    ): Promise<GameViewModel | null> {
        const newData: UpdateGameDbModel = {
            title,
            genre,
            release_year,
            developer,
            description,
            imageURL,
            trailerYoutubeId,
            bannerURL,
        };
        const result = await GamesRepository.updateGame(id, newData);
        if (!result) {
            return null;
        }
        return await GamesRepository.getGameByID(id);
    },
    async updateAvgRating(id: string): Promise<boolean> {
        const reviews = await reviewService.getReviews(id, null);
        const ratings = reviews.map((r) => Number(r.rating)).filter((r) => !isNaN(r));
        let newAvgRating: GameViewModel['avgRating'] = null;
        if (ratings.length !== 0) {
            const updatedAvgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(
                1,
            );
            newAvgRating = Number(updatedAvgRating);
        }
        return await GamesRepository.updateGame(id, { avgRating: newAvgRating });
    },
};
