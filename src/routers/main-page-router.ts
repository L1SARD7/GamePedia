import { Request, Response, Router } from 'express';
import { gamesService } from '../business/games-service';
import { HTTP_CODES } from '../utility';

export const MainRouter = Router({});

MainRouter.get('/', async (req: Request, res: Response) => {
    const newGames = await gamesService.GetLatestGames();
    const topGames = await gamesService.GetTopRatedGames();
    res.status(HTTP_CODES.OK_200).render('main', { newGames, topGames });
});
