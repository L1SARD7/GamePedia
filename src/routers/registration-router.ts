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
    const formData = {
        login: req.body.login,
        email: req.body.email
    }
    if (!validation.isEmpty()) {
        return res.status(HTTP_CODES.BAD_REQUEST_400).render('registration', {
                errors: validation.mapped(),
                formData: formData
            })}
        if (req.body.password !== req.body.repeatPassword) {
            return res.status(HTTP_CODES.BAD_REQUEST_400).render('registration', { 
                errors: { repeatPassword: { msg: 'Паролі не співпадають' } },
                formData: formData
            })
        }

        const exist = await UserRepository.FindUserByLogin(req.body.login)
        if (exist) {
            return res.status(HTTP_CODES.BAD_REQUEST_400).render('registration', {errors: {login: {msg: 'Користувач з таким логіном вже існує'}},
                formData: formData
  
            })
        }
        const CreatedUser = await UserService.CreateNewUser(req.body.login, req.body.email, req.body.password)
            if (CreatedUser) {
                return res.status(HTTP_CODES.Created_201).render('registration', {successMessage: 'Акаунт успішно створений, щоб активувати його перейдіть за посиланням, яке було надіслано на вашу електонну пошту.'}) 
            } 
            else {
                return res.status(HTTP_CODES.BAD_REQUEST_400).render('registration', {
                    globalError: 'Сталася помилка при створенні акаунту. Спробуйте пізніше.',
                    formData: formData
                }
                )
            }   
    }
)