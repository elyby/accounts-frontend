import { Resp as TResp } from './request';
import { Middleware as TMiddleware } from './PromiseMiddlewareLayer';

export { default } from './request';
export { default as InternalServerError } from './InternalServerError';
export { default as RequestAbortedError } from './RequestAbortedError';

export type Resp<T> = TResp<T>;
export type Middleware = TMiddleware;

/**
 * Usage: Query<'required'|'keys'|'names'>
 * TODO: find a way to make it more friendly with URLSearchParams type
 */
export type Query<T extends string> = {
    get: (key: T) => string | void;
    set: (key: T, value: any) => void;
};
