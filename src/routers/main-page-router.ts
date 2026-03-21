import { Router } from 'express';
import { gamesService } from '../business/games-business-layer';

export const MainRouter = Router({});

MainRouter.get('/', async (req, res) => {
    const newGames = await gamesService.GetLatestGames();
    const topGames = await gamesService.GetTopRatedGames();
    res.render('main', { newGames, topGames });
});
