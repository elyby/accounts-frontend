/**
 * A class to handle middleware layer
 */
export default class PromiseMiddlewareLayer {
    /**
     * @private
     */
    middlewares = [];

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
    add(middleware) {
        if (typeof middleware !== 'object') {
            throw new Error('A middleware must be an object');
        }

        if (!this.middlewares.some((mdware) => mdware === middleware)) {
            this.middlewares.push(middleware);
        }
    }

    /**
     * @param {string} action - the name of middleware's hook
     * @param {object} data - the initial data to pass through middlewares chain
     * @param {function} restart - a function to restart current request (for `catch` hook)
     *
     * @return {Promise}
     */
    run(action, data, restart) {
        const promiseMethod = action === 'catch' ? 'catch' : 'then';

        return this.middlewares
            .filter((middleware) => middleware[action])
            .reduce(
                (promise, middleware) => promise[promiseMethod]((resp) => middleware[action](resp, restart)),
                Promise[action === 'catch' ? 'reject' : 'resolve'](data)
            );
    }
}
