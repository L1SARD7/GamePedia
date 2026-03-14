import { Router } from "express"
import { RequestWithParams, RequestWithParamsAndBody } from "../models/RequestTypes"
import { validationResult } from "express-validator"
import { HTTP_CODES } from "../utility"
import { bodyRatingReviewValidatorMiddleware, bodyTextReviewValidatorMiddleware } from "../validator/ReviewInputDataValidator"
import { ReviewInputModel } from "../models/ReviewInputModel"
import { reviewService } from "../business/review-business-layer"
import { URIParamsId } from "../models/URIParamsId"
import { paramsIdValidatorMiddleware } from "../validator/GamesInputDataValidator"
import { gamesService } from "../business/games-business-layer"
import { authMiddleware } from "../validator/auth-middleware"

export const ReviewRouter =  Router({})

ReviewRouter.get('/',
    async (req, res) => {
        if (((!req.query.gameId) && (!req.query.authorId))) {
                res.sendStatus(HTTP_CODES.BAD_REQUEST_400)
        } else {
            let SortedReviews = await reviewService.GetReviews(Number(req.query.gameId), Number(req.query.authorId))
            res.json(SortedReviews).status(HTTP_CODES.OK_200)
        }
    }
)

ReviewRouter.post('/:id', authMiddleware,
    bodyRatingReviewValidatorMiddleware,
    bodyTextReviewValidatorMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsId, ReviewInputModel>, res) => {
    const validation = validationResult(req)
    if (validation.isEmpty()) {
        // @ts-ignore
        if (!req.user) {
            res.status(200).send('Щоб залишити відгук, потрібно бути авторизованим');
        } else {
            // @ts-ignore
            const isAlreadyCreated: [] = await reviewService.GetReviews(+req.params.id, +req.user.id)
            if (isAlreadyCreated.length !== 0) {
                res.status(200).send('В вас вже є залишений відгук цій грі.')
            } else {
                // @ts-ignore
                if (req.user) {
                    // @ts-ignore
                    const CreatedReview = await reviewService.CreateNewReview(+req.body.rating, req.body.text, +req.params.id, req.user.id, req.user.username)
                    if (CreatedReview) {
                        await gamesService.UpdateAvgRating(+req.params.id)
                        res.status(HTTP_CODES.Created_201).redirect(`/games/${req.params.id}`)
                    } else {
                        res.status(HTTP_CODES.BAD_REQUEST_400).redirect(`/`)
                    }
                }
                else {
                    res.status(HTTP_CODES.Unauthorized_401).send('Для того, щоб залишити відгук, необхідно бути авторизованим.')
                }
            }
        }

    }
    else {
        res.status(HTTP_CODES.BAD_REQUEST_400).send({errors: validation.array()})
    }
})

ReviewRouter.delete('/:id', authMiddleware,
    paramsIdValidatorMiddleware,
    async (req: RequestWithParams<URIParamsId>, res) => {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
        res.status(HTTP_CODES.BAD_REQUEST_400).send({errors: validation.array()})
    }
    const isExist : any = await reviewService.GetReviewById(+req.params.id)
    if (isExist) {
        let isDeleted = await reviewService.DeleteReview(+req.params.id)
        if (isDeleted) {
            await gamesService.UpdateAvgRating(isExist.gameId)
            res.status(HTTP_CODES.Deleted_204).redirect(req.body.returnTo)
        }
        else {
            res.status(HTTP_CODES.BAD_REQUEST_400)
        }
    }
    else {
        res.status(HTTP_CODES.BAD_REQUEST_400).send('Такого відгуку не існує.')
    }
})

ReviewRouter.put('/:id', authMiddleware,
    bodyRatingReviewValidatorMiddleware,
    bodyTextReviewValidatorMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsId, ReviewInputModel>, res) => {
    const validation = validationResult(req)
    if (validation.isEmpty()) {
        const isExist : any = await reviewService.GetReviewById(+req.params.id)
        // @ts-ignore
        if (req.user && isExist) {
            // @ts-ignore
            const changedReview = await reviewService.ChangeReview(+req.params.id, +req.body.rating, req.body.text)
            if (changedReview) {
                await gamesService.UpdateAvgRating(isExist.gameId)
                res.status(HTTP_CODES.Created_201).redirect(req.body.returnTo)
            } else {
                res.status(HTTP_CODES.BAD_REQUEST_400)
            }
        }
        else {
            res.send('Для того, щоб залишити відгук, необхідно бути авторизованим.')
        }
    }
    else {
        res.status(HTTP_CODES.BAD_REQUEST_400).send({errors: validation.array()})
    }
})