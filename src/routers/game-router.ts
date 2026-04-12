import type { Request, Response } from 'express';
import { Router } from 'express';
import type {
    GetGameWithQuery,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery,
} from '../models/RequestTypes';
import type { CreateGameInputModel } from '../models/CreateGameInputModel';
import type { UpdateGameInputModel } from '../models/UpdateGameInputModel';
import type { URIParamsId } from '../models/URIParamsId';
import { HTTP_CODES } from '../utility';
import {
    gameDataInputValidatorMiddleware,
    paramsIdValidatorMiddleware,
    queryGenreValidatorMiddleware,
    queryTitleValidatorMiddleware,
} from '../validator/GamesInputDataValidator';
import { validationResult } from 'express-validator';
import { gamesService } from '../business/games-service';
import { reviewService } from '../business/review-service';
import { authMiddleware } from '../validator/auth-middleware';
import { verifyAdmin } from '../validator/verify-admin-middleware';
import { asyncErrorHandler } from '../validator/async-error-handler';
import { config } from '../config';

export const GamesRouter = Router({});

GamesRouter.get(
    '/add',
    authMiddleware,
    verifyAdmin,
    asyncErrorHandler(async (req: Request, res: Response) => {
        res.status(HTTP_CODES.OK_200).render('create-new-game');
    }),
);

GamesRouter.post(
    '/add',
    authMiddleware,
    verifyAdmin,
    gameDataInputValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithBody<CreateGameInputModel>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const CreatedGame = await gamesService.createNewGame(
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
    }),
);

GamesRouter.get(
    '/list',
    queryTitleValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithQuery<{ title: string }>, res) => {
        const validation = validationResult(req);
        if (req.query.title && !validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const gamesList = await gamesService.getGamesByFilter(req.query.title ?? null, null);
        res.render('games-list', { games: gamesList });
    }),
);

GamesRouter.get(
    '/',
    queryTitleValidatorMiddleware,
    queryGenreValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithQuery<GetGameWithQuery>, res: Response) => {
        const validation = validationResult(req);
        if (req.query.title && req.query.genre && !validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const SortedGames = await gamesService.getGamesByFilter(
            req.query.title ?? null,
            req.query.genre ?? null,
        );
        res.status(HTTP_CODES.OK_200).json(SortedGames);
    }),
);

GamesRouter.get(
    '/igdb/search',
    authMiddleware,
    verifyAdmin,
    queryTitleValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithQuery<{ title: string }>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }

        if (!config.IGDB.CLIENT_ID || !config.IGDB.CLIENT_SECRET) {
            res.status(503).send({
                error: 'IGDB integration is not configured. Add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET.',
            });
            return;
        }

        const drafts = await gamesService.searchGameByIgdb(req.query.title);
        res.status(HTTP_CODES.OK_200).json(drafts);
    }),
);

GamesRouter.get(
    '/:id',
    paramsIdValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithParams<URIParamsId>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const FoundGame = await gamesService.getGameByID(req.params.id);
        if (!FoundGame) {
            res.sendStatus(HTTP_CODES.NOT_FOUND_404);
            return;
        }
        const Reviews = await reviewService.getLatestGameReviews(req.params.id);
        res.status(HTTP_CODES.OK_200).render('game-page', {
            game: FoundGame,
            reviews: Reviews,
        });
    }),
);

GamesRouter.get(
    '/:id/edit',
    authMiddleware,
    verifyAdmin,
    paramsIdValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithParams<URIParamsId>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const SelectedGame = await gamesService.getGameByID(req.params.id);
        if (!SelectedGame) {
            res.sendStatus(HTTP_CODES.NOT_FOUND_404);
            return;
        }
        res.status(HTTP_CODES.OK_200).render('edit-game', { game: SelectedGame, error: null });
    }),
);

GamesRouter.delete(
    '/:id',
    authMiddleware,
    verifyAdmin,
    paramsIdValidatorMiddleware,
    asyncErrorHandler(async (req: RequestWithParams<URIParamsId>, res: Response) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
            return;
        }
        const isDeleted = await gamesService.deleteGame(req.params.id);
        if (!isDeleted) {
            res.sendStatus(HTTP_CODES.NOT_FOUND_404);
            return;
        }
        res.redirect('/');
    }),
);

GamesRouter.put(
    '/:id',
    authMiddleware,
    verifyAdmin,
    paramsIdValidatorMiddleware,
    gameDataInputValidatorMiddleware,
    asyncErrorHandler(
        async (req: RequestWithParamsAndBody<URIParamsId, UpdateGameInputModel>, res: Response) => {
            const validation = validationResult(req);
            if (!validation.isEmpty()) {
                res.status(HTTP_CODES.BAD_REQUEST_400).send({ errors: validation.array() });
                return;
            }
            const UpdatedGame = await gamesService.updateGame(
                req.params.id,
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
    ),
);
