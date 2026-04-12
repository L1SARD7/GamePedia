import { gamesService } from '../../src/business/games-service';
import { GamesRepository } from '../../src/repositories/games-db-repository';
import { reviewService } from '../../src/business/review-service';

jest.mock('../../src/repositories/games-db-repository', () => ({
    GamesRepository: {
        getGames: jest.fn(),
        getSortedGames: jest.fn(),
        updateGame: jest.fn(),
    },
}));

jest.mock('../../src/business/review-service', () => ({
    reviewService: {
        getReviews: jest.fn(),
    },
}));

describe('gamesService tests (junior style)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should build filter with title and genre', async () => {
        (GamesRepository.getGames as jest.Mock).mockResolvedValue([]);

        await gamesService.getGamesByFilter('witch', 'RPG');

        expect(GamesRepository.getGames).toHaveBeenCalledWith({
            title: { $regex: 'witch', $options: 'i' },
            genre: 'RPG',
        });
    });

    it('should request latest games with createdAt sort', async () => {
        await gamesService.getLatestGames();

        expect(GamesRepository.getSortedGames).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should request top rated games with avgRating sort', async () => {
        await gamesService.getTopRatedGames();

        expect(GamesRepository.getSortedGames).toHaveBeenCalledWith({ avgRating: -1 });
    });

    it('should update avg rating to rounded number', async () => {
        (reviewService.getReviews as jest.Mock).mockResolvedValue([
            { rating: 10 },
            { rating: 8 },
            { rating: 9 },
        ]);
        (GamesRepository.updateGame as jest.Mock).mockResolvedValue(true);

        await gamesService.updateAvgRating('game-1');

        expect(GamesRepository.updateGame).toHaveBeenCalledWith('game-1', { avgRating: 9 });
    });

    it('should set avg rating to null when there are no valid ratings', async () => {
        (reviewService.getReviews as jest.Mock).mockResolvedValue([{ rating: Number.NaN }]);
        (GamesRepository.updateGame as jest.Mock).mockResolvedValue(true);

        await gamesService.updateAvgRating('game-2');

        expect(GamesRepository.updateGame).toHaveBeenCalledWith('game-2', { avgRating: null });
    });
});
