import { createStore, applyMiddleware, compose, StoreEnhancer } from 'redux';
// midleware, который позволяет возвращать из экшенов функции
// это полезно для работы с асинхронными действиями,
// а также дает возможность проверить какие-либо условия перед запуском экшена
// или даже вообще его не запускать в зависимости от условий
import thunk from 'redux-thunk';
import persistState from 'redux-localstorage';

import reducers from 'app/reducers';
import { Store } from 'app/types';

export default function storeFactory(preloadedState = {}): Store {
    const middlewares = applyMiddleware(thunk);
    const persistStateEnhancer = persistState(['accounts', 'user'], {
        key: 'redux-storage',
    });

    let enhancer: StoreEnhancer;

    if (process.env.NODE_ENV === 'production') {
        enhancer = compose(middlewares, persistStateEnhancer);
    } else {
        const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
        enhancer = composeEnhancers(middlewares, persistStateEnhancer);
    }

    const store = createStore(reducers, preloadedState, enhancer) as Store;

    // Hot reload reducers
    if (module.hot && typeof module.hot.accept === 'function') {
        module.hot.accept('app/reducers', () => store.replaceReducer(require('app/reducers').default));
    }

    return store;
}
