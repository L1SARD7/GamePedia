import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Забагато запитів з цього IP, спробуйте пізніше.',
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: {
        errors: [{ msg: 'Забагато спроб авторизації. Спробуйте через годину.' }],
    },

    handler: (req, res, next, options) => {
        if (req.accepts('json') && !req.accepts('html')) {
            res.status(options.statusCode).send(options.message);
        } else {
            res.status(options.statusCode).render('error', {
                error: 'Забагато спроб. Спробуйте пізніше.',
            });
        }
    },
});
