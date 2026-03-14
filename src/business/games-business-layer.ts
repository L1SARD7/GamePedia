import { GamesRepository } from "../repositories/games-db-repository"
import { reviewService } from "./review-business-layer"

export const gamesService = {
    async GetGamesByFilter(title: string | null, genre: string | null) {
        let filter: any = {}
        if (title) {
            filter.title = title
        }
        return await GamesRepository.GetGames(filter)
    },

    async FindGamesByTitle(title: string) {
        return await GamesRepository.FindGamesByTitle(title)
    },

    async GetAllGames() {
        return await GamesRepository.GetAllGames()
    },

    async GetManyGamesByID(gameIds: any) {
        return await GamesRepository.GetManyGamesByID(gameIds)
    },

    async GetGameByID(id: number) {
        return await GamesRepository.GetGameByID(id)
    },

    async GetLatestGames() {
        return await GamesRepository.GetSortedGames({ id: -1 })
    },

    async GetTopRatedGames() {
        return await GamesRepository.GetSortedGames({ avgRating: -1 })
    },

    async DeleteGame(id: number) {
        return await GamesRepository.DeleteGame(id)
    },

    async CreateNewGame(title: string, genre: string, release_year: number, developer: string, description: string, imageURL: string, trailerYoutubeId: string, bannerURL: string): Promise<any> {
        const newGame = {
            id: +(new Date()),
            title: title,
            genre: genre,
            release_year: release_year,
            developer: developer,
            description: description,
            imageURL: imageURL,
            trailerYoutubeId: trailerYoutubeId,
            bannerURL: bannerURL,
            avgRating: null
        }
        await GamesRepository.CreateNewGame(newGame)
        const CreatedGame = await GamesRepository.GetGameByID(newGame.id)
        return CreatedGame
    },

    async UpdateGame(id: number, title: string, genre: string, release_year: number, developer: string, description: string, imageURL: string, trailerYoutubeId: string, bannerURL: string) {
        const newData = {
            title: title,
            genre: genre,
            release_year: release_year,
            developer: developer,
            description: description,
            imageURL: imageURL,
            trailerYoutubeId: trailerYoutubeId,
            bannerURL: bannerURL
        }
        let result = await GamesRepository.UpdateGame(id, newData)
        if (result) {
            return await GamesRepository.GetGameByID(id)
        } else {
            return null
        }
    },
    async UpdateAvgRating(id: number) {
        const Reviews = await reviewService.GetReviews(id, null) || []
        const ratings = Reviews.map(r => Number(r.rating)).filter(r => !isNaN(r));
        let newAvgRating = null
        if (ratings.length !== 0) {
            const updatedAvgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
            newAvgRating = Number(updatedAvgRating)
        }
        const newData = {
            avgRating: newAvgRating
        } 
        return await GamesRepository.UpdateGame(id, newData)
    }
}