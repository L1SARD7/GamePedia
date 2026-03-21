import { Request } from 'express';

export type RequestWithQuerry<T> = Request<{}, {}, {}, T, {}>;
export type RequestWithParams<T> = Request<T>;
export type GetGameWithQuerry = {
    title: string;
    genre: string;
};

export type RequestWithBody<T> = Request<{}, {}, T>;

export type RequestWithParamsAndBody<T1, T2> = Request<T1, {}, T2>;
