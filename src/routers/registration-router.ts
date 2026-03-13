import { Router } from "express"
import { RequestWithBody } from "../models/RequestTypes"
import { bodyemailValidatorMiddleware, bodyLoginValidatorMiddleware, bodyPasswordValidatorMiddleware } from "../validator/LoginAndRegInputDataValidator"
import { validationResult } from "express-validator"
import { HTTP_CODES } from "../utility"
import { UserRepository } from "../repositories/user-db-repository"
import { RegistrationInputModel } from "../models/RegistrationInputModel"
import { UserService } from "../business/user-business-layer"

export const RegistrationRouter =  Router({})


RegistrationRouter.get('/confirmEmail/:confirmationCode', async(req: any, res)=> {
    const result = await UserService.confirmEmail(+req.query.userId, req.params.confirmationCode)
    if (result) {
        res.redirect('/login')
    } else {
        res.status(400).send('Невірний або прострочений код підтвердження')
    }
})

RegistrationRouter.get('/', 
    (req, res) => {
    res.render('registration')
})

RegistrationRouter.post('/',
    bodyLoginValidatorMiddleware,
    bodyemailValidatorMiddleware,
    bodyPasswordValidatorMiddleware,
    async (req: RequestWithBody<RegistrationInputModel>, res) => {
    const validation = validationResult(req)
    if (validation.isEmpty()) {
        if (req.body.password !== req.body.repeatPassword) {
            res.status(HTTP_CODES.BAD_REQUEST_400).send('Паролі не співпадають')
        }
        else {
        const exist = await UserRepository.FindUserByLogin(req.body.login)
        if (!exist) {
            const CreatedUser = await UserService.CreateNewUser(req.body.login, req.body.email, req.body.password)
            if (CreatedUser) {
                res.status(HTTP_CODES.Created_201).redirect('/profile')
            } 
            else {
                res.sendStatus(HTTP_CODES.BAD_REQUEST_400)
            }   
        }
        else {
            res.status(HTTP_CODES.BAD_REQUEST_400).send('Користувач з таким логіном вже існує')
        }
    }
}
else {
    res.status(HTTP_CODES.BAD_REQUEST_400).send({errors: validation.array()})
}
})