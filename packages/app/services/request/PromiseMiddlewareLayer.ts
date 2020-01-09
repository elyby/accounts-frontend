import { Options } from './request';

type Action = 'catch' | 'then' | 'before';

interface MiddlewareRequestOptions {
  url: string;
  options: Options;
}

export interface Middleware {
  before?: (
    options: MiddlewareRequestOptions,
  ) => Promise<MiddlewareRequestOptions>;
  then?: (resp: any, options: MiddlewareRequestOptions) => Promise<any>;
  catch?: (
    resp: any,
    options: MiddlewareRequestOptions,
    restart: () => Promise<any>,
  ) => Promise<any>;
}

/**
 * A class to handle middleware layer
 */
class PromiseMiddlewareLayer {
  private middlewares: Middleware[] = [];

  /**
   * Adds middleware into layer.
   *
   * `middleware` is an object, that may have multiple keys of type function.
   * Each key is a name of an action that may be passed through the layer. Each
   * function should return a Promise. An action with name catch has a special
   * meaning: it will be invoked as catch callback on Promise (for middlewares,
   * that should handle errors)
   *
   * @param {object} middleware
   */
  add(middleware: Middleware) {
    if (typeof middleware !== 'object') {
      throw new Error('A middleware must be an object');
    }

    if (!this.middlewares.some(mdware => mdware === middleware)) {
      this.middlewares.push(middleware);
    }
  }

  /**
   * @param {string} action - the name of middleware's hook
   * @param {object} data - the initial data to pass through middlewares chain
   * @param {Function} restart - a function to restart current request (for `catch` hook)
   *
   * @returns {Promise}
   */
  run(
    action: 'before',
    options: MiddlewareRequestOptions,
    arg3?: never,
    arg4?: never,
  ): Promise<MiddlewareRequestOptions>;
  run(
    action: 'then',
    resp: any,
    options: MiddlewareRequestOptions,
    arg4?: never,
  ): Promise<any>;
  run(
    action: 'catch',
    resp: any,
    options: MiddlewareRequestOptions,
    restart: () => Promise<any>,
  ): Promise<any>;
  run(action: Action, data, ...rest) {
    const promiseMethod = action === 'catch' ? 'catch' : 'then';

    return this.middlewares
      .filter(middleware => middleware[action])
      .reduce(
        (promise: Promise<any>, middleware) =>
          invoke(
            promise,
            promiseMethod,
          )(resp => invoke(middleware, action)(resp, ...rest)),
        invoke(Promise, action === 'catch' ? 'reject' : 'resolve')(data),
      );
  }
}

function invoke(instance: { [key: string]: any }, method: string) {
  if (typeof instance[method] !== 'function') {
    throw new Error(`Can not invoke ${method} on ${instance}`);
  }

  return (...args) => instance[method](...args);
}

export default PromiseMiddlewareLayer;
