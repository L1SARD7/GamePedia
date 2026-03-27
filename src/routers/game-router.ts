import { Router, Request, Response } from 'express';
import {
    GetGameWithQuery,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery,
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

GamesRouter.get('/add', authMiddleware, verifyAdmin, async (req: Request, res: Response) => {
    res.status(HTTP_CODES.OK_200).render('create-new-game');
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
            return;
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

        if (!CreatedGame) {
            res.sendStatus(HTTP_CODES.BAD_REQUEST_400);
            return;
        }
        res.redirect(`/games/${CreatedGame.id}`);
    },
);

GamesRouter.get(
    '/list',
    queryTitleValidatorMiddleware,
    async (req: RequestWithQuery<{ title: string }>, res) => {
        const validation = validationResult(req);
        if (req.query.title && !validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const gamesList = await gamesService.GetGamesByFilter(req.query.title ?? null, null);
        res.render('games-list', { games: gamesList });
    },
);

GamesRouter.get(
    '/',
    queryTitleValidatorMiddleware,
    queryGenreValidatorMiddleware,
    async (req: RequestWithQuery<GetGameWithQuery>, res: Response) => {
        const validation = validationResult(req);
        if (req.query.title && req.query.genre && !validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const SortedGames = await gamesService.GetGamesByFilter(
            req.query.title ?? null,
            req.query.genre ?? null,
        );
        res.status(HTTP_CODES.OK_200).json(SortedGames);
    },
);

GamesRouter.get(
    '/:id',
    paramsIdValidatorMiddleware,
    async (req: RequestWithParams<URIParamsId>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const FoundGame = await gamesService.GetGameByID(+req.params.id);
        if (!FoundGame) {
            res.sendStatus(HTTP_CODES.NOT_FOUND_404);
            return;
        }
        const Reviews = await reviewService.GetReviews(+req.params.id, null);
        res.status(HTTP_CODES.OK_200).render('game-page', {
            game: FoundGame,
            reviews: Reviews,
        });
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
            return;
        }
        const SelectedGame = await gamesService.GetGameByID(+req.params.id);
        if (!SelectedGame) {
            res.sendStatus(HTTP_CODES.NOT_FOUND_404);
            return;
        }
        res.status(HTTP_CODES.OK_200).render('edit-game', { game: SelectedGame, error: null });
    },
);

GamesRouter.delete(
    '/:id',
    authMiddleware,
    verifyAdmin,
    paramsIdValidatorMiddleware,
    async (req: RequestWithParams<URIParamsId>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const isDeleted = await gamesService.DeleteGame(+req.params.id);
        if (!isDeleted) {
            res.sendStatus(HTTP_CODES.NOT_FOUND_404);
            return;
        }
        res.redirect('/');
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
            return;
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
        if (!UpdatedGame) {
            res.sendStatus(HTTP_CODES.NOT_FOUND_404);
            return;
        }
        res.redirect(`/games/${req.params.id}`);
    },
);
