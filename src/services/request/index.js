import request from './request';
import InternalServerError from './InternalServerError';

/**
 * Usage: Query<'requeired'|'keys'|'names'>
 * TODO: find a way to make it more friendly with URLSearchParams type
 */
export type Query<T: string> = {
    get: (key: T) => ?string,
    set: (key: T, value: any) => void,
};

export default request;

export { InternalServerError };
