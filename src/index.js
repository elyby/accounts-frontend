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
import { syncHistory, routeReducer } from 'react-router-redux';

import { IntlProvider } from 'react-intl';

import reducers from 'reducers';
import routesFactory from 'routes';

import 'index.scss';

const reducer = combineReducers({
    ...reducers,
    routing: routeReducer
});

const reduxRouterMiddleware = syncHistory(browserHistory);

const store = applyMiddleware(
    reduxRouterMiddleware,
    thunk
)(createStore)(reducer);

if (process.env.NODE_ENV !== 'production') {
    // some shortcuts for testing on localhost

    window.testOAuth = () => location.href = '/oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session';
}

ReactDOM.render(
    <IntlProvider locale="en" messages={{}}>
        <ReduxProvider store={store}>
            <Router history={browserHistory}>
                {routesFactory(store)}
            </Router>
        </ReduxProvider>
    </IntlProvider>,
    document.getElementById('app')
);
