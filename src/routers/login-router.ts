import { Router } from "express"
import { RequestWithBody } from "../models/RequestTypes"
import { LoginInputModel } from "../models/LoginInputModel"
import { bodyLoginValidatorMiddleware, bodyPasswordValidatorMiddleware } from "../validator/LoginAndRegInputDataValidator"
import { validationResult } from "express-validator"
import { HTTP_CODES } from "../utility"
import { UserRepository } from "../repositories/user-db-repository"
import { UserService } from "../business/user-business-layer"

export const LoginRouter =  Router({})



LoginRouter.get('/', 
    (req, res) => {
    res.render('login')
})

LoginRouter.post('/',
    bodyLoginValidatorMiddleware,
    bodyPasswordValidatorMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res) => {
    const validation = validationResult(req)
    if (validation.isEmpty()) {
        const user = await UserService.authorizationUser(req.body.login, req.body.password)
        if (user) {
                // @ts-ignore
                req.session.user = user;
                res.redirect('/profile');
            } else {
                res.status(HTTP_CODES.BAD_REQUEST_400).send('Неправильний логін або пароль')
            }
        }
    else {
        res.status(HTTP_CODES.BAD_REQUEST_400).send({errors: validation.array()})
    }
})