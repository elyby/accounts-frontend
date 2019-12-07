import { createStore, applyMiddleware, compose } from 'redux';
// midleware, который позволяет возвращать из экшенов функции
// это полезно для работы с асинхронными действиями,
// а также дает возможность проверить какие-либо условия перед запуском экшена
// или даже вообще его не запускать в зависимости от условий
import thunk from 'redux-thunk';
import persistState from 'redux-localstorage';

import reducers from 'reducers';

export default function storeFactory() {
  const middlewares = applyMiddleware(thunk);
  const persistStateEnhancer = persistState(['accounts', 'user'], {
    key: 'redux-storage',
  });

  /* global process: false */
  let enhancer;

  if (process.env.NODE_ENV === 'production') {
    enhancer = compose(middlewares, persistStateEnhancer);
  } else {
    const composeEnhancers =
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(middlewares, persistStateEnhancer);
  }

  const store = createStore(reducers, {}, enhancer);

  // Hot reload reducers
  if (module.hot && typeof module.hot.accept === 'function') {
    module.hot.accept('reducers', () =>
      store.replaceReducer(require('reducers').default),
    );
  }

  return store;
}
