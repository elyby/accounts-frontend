import { createStore, applyMiddleware, compose } from 'redux';
// midleware, который позволяет возвращать из экшенов функции
// это полезно для работы с асинхронными действиями,
// а также дает возможность проверить какие-либо условия перед запуском экшена
// или даже вообще его не запускать в зависимости от условий
import thunk from 'redux-thunk';
import persistState from 'redux-localstorage';
import { syncHistory } from 'react-router-redux';
import { browserHistory } from 'react-router';

import reducers from 'reducers';

export default function storeFactory() {
    const reduxRouterMiddleware = syncHistory(browserHistory);
    const middlewares = applyMiddleware(
        reduxRouterMiddleware,
        thunk
    );
    const persistStateEnhancer = persistState([
        'accounts'
    ], {key: 'redux-storage'});

    /* global process: false */
    let enhancer;
    if (process.env.NODE_ENV === 'production') {
        enhancer = compose(middlewares, persistStateEnhancer);
    } else {
        const DevTools = require('containers/DevTools').default;
        enhancer = compose(middlewares, persistStateEnhancer, DevTools.instrument());
    }

    const store = createStore(reducers, {}, enhancer);

    // Hot reload reducers
    if (module.hot) {
        module.hot.accept('reducers', () =>
            store.replaceReducer(require('reducers').default)
        );
    }

    return store;
}
