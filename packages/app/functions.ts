import {
    connect as reduxConnect,
    MapDispatchToPropsParam,
    MapStateToPropsParam,
    useDispatch,
    useSelector,
} from 'react-redux';

import { State, Dispatch } from 'app/types';

export const connect = <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}>(
    mapStateToProps?: MapStateToPropsParam<TStateProps, TOwnProps, State> | null | undefined,
    dispatchProps?: MapDispatchToPropsParam<TDispatchProps, TOwnProps> | null | undefined,
    // mergeProps,
    // options,
) => reduxConnect(mapStateToProps, dispatchProps /*, mergeProps, options*/);

export const useReduxDispatch = () => useDispatch<Dispatch>();
export const useReduxSelector = <TSelected>(
    selector: (state: State) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean,
): TSelected => useSelector<State, TSelected>(selector, equalityFn);

let lastId = 0;
export function uniqueId(prefix: string = 'id'): string {
    return `${prefix}${++lastId}`;
}

/**
 * @param {object} obj
 * @param {Array} keys
 *
 * @returns {object}
 */
export function omit(obj: { [key: string]: any }, keys: Array<string>): { [key: string]: any } {
    const newObj = { ...obj };

    keys.forEach((key) => {
        Reflect.deleteProperty(newObj, key);
    });

    return newObj;
}

/**
 * Asynchronously loads script
 *
 * @param {string} src
 *
 * @returns {Promise}
 */
export function loadScript(src: string): Promise<void> {
    const script = document.createElement('script');

    script.async = true;
    script.defer = true;
    script.src = src;

    return new Promise((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = reject;

        if (document && document.body) {
            document.body.appendChild(script);
        }
    });
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear'
 * that is a function which will clear the timer to prevent previously scheduled executions.
 *
 * @source https://github.com/component/debounce
 *
 * @param {Function} function - function to wrap
 * @param {number} [timeout=100] - timeout in ms
 * @param {bool} [immediate=false] - whether to execute at the beginning
 */
export { default as debounce } from 'debounce';

/**
 * @param {string} jwt
 *
 * @throws {Error} If can not decode token
 *
 * @returns {object} - decoded jwt payload
 */
export function getJwtPayloads(
    jwt: string,
): {
    sub: string;
    jti: number;
    exp: number;
} {
    const parts = (jwt || '').split('.');

    if (parts.length !== 3) {
        throw new Error('Invalid jwt token');
    }

    try {
        return JSON.parse(atob(parts[1]));
    } catch (err) {
        throw new Error('Can not decode jwt token');
    }
}
