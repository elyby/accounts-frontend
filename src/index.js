import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';

// midleware, который позволяет возвращать из экшенов функции
// это полезно для работы с асинхронными действиями,
// а также дает возможность проверить какие-либо условия перед запуском экшена
// или даже вообще его не запускать в зависимости от условий
import thunk from 'redux-thunk';

import { Router, browserHistory } from 'react-router';
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router';

import { IntlProvider } from 'react-intl';

import reducers from 'reducers';
import routes from 'routes';

const reducer = combineReducers({
    ...reducers,
    routing: routeReducer
});

const store = applyMiddleware(
    thunk
)(createStore)(reducer);

syncReduxAndRouter(browserHistory, store);

ReactDOM.render(
  <IntlProvider locale="en" messages={{}}>
      <ReduxProvider store={store}>
        <Router history={browserHistory}>
            {routes}
        </Router>
      </ReduxProvider>
  </IntlProvider>,
  document.getElementById('app')
);
