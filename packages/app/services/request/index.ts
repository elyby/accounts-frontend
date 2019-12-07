export { default, Resp } from './request';
export { Middleware } from './PromiseMiddlewareLayer';
export { default as InternalServerError } from './InternalServerError';
export { default as RequestAbortedError } from './RequestAbortedError';

/**
 * Usage: Query<'requeired'|'keys'|'names'>
 * TODO: find a way to make it more friendly with URLSearchParams type
 */
export type Query<T extends string> = {
  get: (key: T) => string | void;
  set: (key: T, value: any) => void;
};
