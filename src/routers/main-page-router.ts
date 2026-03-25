import { Router } from 'express';
import { gamesService } from '../business/games-business-layer';
import { HTTP_CODES } from '../utility';

export const MainRouter = Router({});

MainRouter.get('/', async (req, res) => {
    const newGames = await gamesService.GetLatestGames();
    const topGames = await gamesService.GetTopRatedGames();
    res.status(HTTP_CODES.OK_200).render('main', { newGames, topGames });
});
