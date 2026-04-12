import type { Request, Response } from 'express';
import { Router } from 'express';
import { gamesService } from '../business/games-service';
import { HTTP_CODES } from '../utility';
import { asyncErrorHandler } from '../validator/async-error-handler';

export const MainRouter = Router({});

MainRouter.get(
    '/',
    asyncErrorHandler(async (req: Request, res: Response) => {
        const newGames = await gamesService.getLatestGames();
        const topGames = await gamesService.getTopRatedGames();
        res.status(HTTP_CODES.OK_200).render('main', { newGames, topGames });
    }),
);
