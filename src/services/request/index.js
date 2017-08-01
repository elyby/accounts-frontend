// @flow
export { default } from './request';
export type { Resp } from './request';
export { default as InternalServerError } from './InternalServerError';

/**
 * Usage: Query<'requeired'|'keys'|'names'>
 * TODO: find a way to make it more friendly with URLSearchParams type
 */
export type Query<T: string> = {
    get: (key: T) => ?string,
    set: (key: T, value: any) => void,
};
