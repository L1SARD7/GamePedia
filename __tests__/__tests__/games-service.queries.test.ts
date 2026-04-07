import { gamesService } from '../../src/business/games-service';
import { GamesRepository } from '../../src/repositories/games-db-repository';
import { reviewService } from '../../src/business/review-service';

jest.mock('../../src/repositories/games-db-repository', () => ({
    GamesRepository: {
        GetGames: jest.fn(),
        GetSortedGames: jest.fn(),
        UpdateGame: jest.fn(),
    },
}));

jest.mock('../../src/business/review-service', () => ({
    reviewService: {
        GetReviews: jest.fn(),
    },
}));

describe('gamesService tests (junior style)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should build filter with title and genre', async () => {
        (GamesRepository.GetGames as jest.Mock).mockResolvedValue([]);

        await gamesService.GetGamesByFilter('witch', 'RPG');

        expect(GamesRepository.GetGames).toHaveBeenCalledWith({
            title: { $regex: 'witch', $options: 'i' },
            genre: 'RPG',
        });
    });

    it('should request latest games with createdAt sort', async () => {
        await gamesService.GetLatestGames();

        expect(GamesRepository.GetSortedGames).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should request top rated games with avgRating sort', async () => {
        await gamesService.GetTopRatedGames();

        expect(GamesRepository.GetSortedGames).toHaveBeenCalledWith({ avgRating: -1 });
    });

    it('should update avg rating to rounded number', async () => {
        (reviewService.GetReviews as jest.Mock).mockResolvedValue([
            { rating: 10 },
            { rating: 8 },
            { rating: 9 },
        ]);
        (GamesRepository.UpdateGame as jest.Mock).mockResolvedValue(true);

        await gamesService.UpdateAvgRating('game-1');

        expect(GamesRepository.UpdateGame).toHaveBeenCalledWith('game-1', { avgRating: 9 });
    });

    it('should set avg rating to null when there are no valid ratings', async () => {
        (reviewService.GetReviews as jest.Mock).mockResolvedValue([{ rating: Number.NaN }]);
        (GamesRepository.UpdateGame as jest.Mock).mockResolvedValue(true);

        await gamesService.UpdateAvgRating('game-2');

        expect(GamesRepository.UpdateGame).toHaveBeenCalledWith('game-2', { avgRating: null });
    });
});
