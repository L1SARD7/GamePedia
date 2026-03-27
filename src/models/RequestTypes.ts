import { Request } from 'express';

export type RequestWithQuery<TQuery> = Request<{}, {}, {}, TQuery, {}>;
export type RequestWithParams<TParams> = Request<TParams>;
export type GetGameWithQuery = {
    title: string;
    genre: string;
};

export type RequestWithBody<TBody> = Request<{}, {}, TBody>;
export type RequestWithParamsAndQuery<TParams, TQuery> = Request<TParams, {}, {}, TQuery>;

export type RequestWithParamsAndBody<TParams, TBody> = Request<TParams, {}, TBody>;
