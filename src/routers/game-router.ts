import { Router, Response } from 'express';
import {
    GetGameWithQuerry,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuerry,
} from '../models/RequestTypes';
import { CreateGameInputModel } from '../models/CreateGameInputModel';
import { UpdateGameInputModel } from '../models/UpdateGameInputModel';
import { URIParamsId } from '../models/URIParamsId';
import { HTTP_CODES } from '../utility';
import {
    gameDataInputValidatorMiddleware,
    paramsIdValidatorMiddleware,
    queryGenreValidatorMiddleware,
    queryTitleValidatorMiddleware,
} from '../validator/GamesInputDataValidator';
import { validationResult } from 'express-validator';
import { gamesService } from '../business/games-business-layer';
import { reviewService } from '../business/review-business-layer';
import { authMiddleware } from '../validator/auth-middleware';
import { verifyAdmin } from '../validator/verify-admin-middleware';

export const GamesRouter = Router({});

GamesRouter.get('/add', authMiddleware, verifyAdmin, async (req: any, res: any) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(HTTP_CODES.Unauthorized_401).send('Доступ лише для адміністратора');
    }
    res.render('create-new-game');
});

GamesRouter.post(
    '/add',
    authMiddleware,
    verifyAdmin,
    gameDataInputValidatorMiddleware,
    async (req: RequestWithBody<CreateGameInputModel>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
        }
        const CreatedGame = await gamesService.CreateNewGame(
            req.body.title,
            req.body.genre,
            req.body.release_year,
            req.body.developer,
            req.body.description,
            req.body.imageURL,
            req.body.trailerYoutubeId,
            req.body.bannerURL,
        );

        if (CreatedGame) {
            return res.status(HTTP_CODES.Created_201).redirect(`/games/${CreatedGame.id}`);
        } else {
            res.sendStatus(HTTP_CODES.BAD_REQUEST_400);
        }
    },
);

GamesRouter.get('/list', queryTitleValidatorMiddleware, async (req: any, res) => {
    const validation = validationResult(req);
    if (req.query.title && !validation.isEmpty()) {
        res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
    }
    let gamesList;
    if (req.query.title) {
        gamesList = await gamesService.FindGamesByTitle(req.query.title);
    } else {
        gamesList = await gamesService.GetAllGames();
    }
    res.render('games-list', { games: gamesList });
});

GamesRouter.get(
    '/',
    queryTitleValidatorMiddleware,
    queryGenreValidatorMiddleware,
    async (req: RequestWithQuerry<GetGameWithQuerry>, res: Response) => {
        const validation = validationResult(req);
        if (req.query.title && req.query.genre && !validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
        }
        const SortedGames = await gamesService.GetGamesByFilter(req.query.title, req.query.genre);
        res.json(SortedGames).status(HTTP_CODES.OK_200);
    },
);

GamesRouter.get(
    '/:id',
    paramsIdValidatorMiddleware,
    async (req: RequestWithParams<URIParamsId>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
        }
        const FoundGame = await gamesService.GetGameByID(+req.params.id);
        const Reviews = await reviewService.GetReviews(+req.params.id, null);
        if (FoundGame) {
            res.status(HTTP_CODES.OK_200).render('game-page', {
                game: FoundGame,
                reviews: Reviews,
            });
        } else {
            res.sendStatus(HTTP_CODES.BAD_REQUEST_400);
        }
    },
);

GamesRouter.get(
    '/:id/edit',
    authMiddleware,
    verifyAdmin,
    paramsIdValidatorMiddleware,
    async (req: RequestWithParams<URIParamsId>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
        }
        const SelectedGame = await gamesService.GetGameByID(+req.params.id);
        if (SelectedGame) {
            res.status(HTTP_CODES.OK_200).render('edit-game', { game: SelectedGame, error: null });
        } else {
            res.sendStatus(HTTP_CODES.BAD_REQUEST_400);
        }
    },
);

GamesRouter.delete(
    '/:id',
    authMiddleware,
    verifyAdmin,
    paramsIdValidatorMiddleware,
    async (req: RequestWithParams<URIParamsId>, res) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
        }
        const isDeleted = await gamesService.DeleteGame(+req.params.id);
        if (isDeleted) {
            res.status(HTTP_CODES.Deleted_204).redirect('/');
        } else {
            res.sendStatus(HTTP_CODES.BAD_REQUEST_400);
        }
    },
);

GamesRouter.put(
    '/:id',
    authMiddleware,
    verifyAdmin,
    paramsIdValidatorMiddleware,
    gameDataInputValidatorMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsId, UpdateGameInputModel>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
        }
        const UpdatedGame = await gamesService.UpdateGame(
            +req.params.id,
            req.body.title,
            req.body.genre,
            req.body.release_year,
            req.body.developer,
            req.body.description,
            req.body.imageURL,
            req.body.trailerYoutubeId,
            req.body.bannerURL,
        );
        if (UpdatedGame) {
            res.status(HTTP_CODES.OK_200).redirect(`/games/${req.params.id}`);
        } else {
            res.sendStatus(HTTP_CODES.BAD_REQUEST_400);
        }
    },
);
