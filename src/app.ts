import express from 'express';
import { GamesRouter } from './routers/game-router';
import { LoginRouter } from './routers/login-router';
import { RegistrationRouter } from './routers/registration-router';
import { ProfileRouter } from './routers/profile-router';
import { ReviewRouter } from './routers/review-router';
import methodOverride from 'method-override';
import { MainRouter } from './routers/main-page-router';
import cookieParser from 'cookie-parser';
import { jwtService } from './application/jwtService';
import { globalErrorHandler } from './validator/error-handler';
import { asyncErrorHandler } from './validator/async-error-handler';
import { AppError } from './models/AppError';

export const app = express();

const BodyJsonMiddleware = express.json();
app.use(BodyJsonMiddleware);

app.set('view engine', 'ejs');
app.use(express.static('front'));

app.use(cookieParser());

app.use(
    asyncErrorHandler(async (req, res, next) => {
        res.locals.user = null;

        if (req.cookies.accessToken) {
            const userInfo = await jwtService.getUserInfoByToken(req.cookies.accessToken);
            res.locals.user = userInfo;
        }
        next();
    }),
);
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

app.use('/games', GamesRouter);

app.use('/login', LoginRouter);

app.use('/registration', RegistrationRouter);

app.use('/profile', ProfileRouter);

app.use('/review', ReviewRouter);

app.use('/', MainRouter);

app.all('*', (req, res, next) => {
    const err: AppError = new Error(`Упс! Сторінку ${req.originalUrl} не знайдено`);
    err.statusCode = 404;
    next(err);
});

app.use(globalErrorHandler);
