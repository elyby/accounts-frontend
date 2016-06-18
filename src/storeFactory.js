import { createStore, applyMiddleware, compose } from 'redux';
// midleware, который позволяет возвращать из экшенов функции
// это полезно для работы с асинхронными действиями,
// а также дает возможность проверить какие-либо условия перед запуском экшена
// или даже вообще его не запускать в зависимости от условий
import thunk from 'redux-thunk';
import { syncHistory } from 'react-router-redux';
import { browserHistory } from 'react-router';

import reducers from 'reducers';
import DevTools from 'containers/DevTools';

export default function storeFactory() {
    const reduxRouterMiddleware = syncHistory(browserHistory);
    const middlewares = applyMiddleware(
        reduxRouterMiddleware,
        thunk
    );

    /* global process: false */
    let enhancer;
    if (process.env.NODE_ENV === 'production') {
        enhancer = compose(middlewares);
    } else {
        enhancer = compose(middlewares, DevTools.instrument());
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
