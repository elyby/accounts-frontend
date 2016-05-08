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

import { IntlProvider, addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import ruLocaleData from 'react-intl/locale-data/ru';

import reducers from 'reducers';
import routesFactory from 'routes';

const reducer = combineReducers({
    ...reducers,
    routing: routeReducer
});

const reduxRouterMiddleware = syncHistory(browserHistory);

const store = applyMiddleware(
    reduxRouterMiddleware,
    thunk
)(createStore)(reducer);

addLocaleData(enLocaleData);
addLocaleData(ruLocaleData);

// TODO: bind with user state
const SUPPORTED_LANGUAGES = ['ru', 'en'];
const DEFAULT_LANGUAGE = 'en';
const state = store.getState();
function getUserLanguages() {
    return [].concat(state.user.lang || [])
        .concat(navigator.languages || [])
        .concat(navigator.language || []);
}

function detectLanguage(userLanguages, availableLanguages, defaultLanguage) {
    return (userLanguages || [])
        .concat(defaultLanguage)
        .map((lang) => lang.split('-').shift().toLowerCase())
        .find((lang) => availableLanguages.indexOf(lang) !== -1);
}

const locale = detectLanguage(getUserLanguages(), SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE);

new Promise(require(`bundle!i18n/${locale}.json`))
    .then((messages) => {
        ReactDOM.render(
            <IntlProvider locale={locale} messages={messages}>
                <ReduxProvider store={store}>
                    <Router history={browserHistory}>
                        {routesFactory(store)}
                    </Router>
                </ReduxProvider>
            </IntlProvider>,
            document.getElementById('app')
        );

        document.getElementById('loader').classList.remove('is-active');
    });



if (process.env.NODE_ENV !== 'production') {
    // some shortcuts for testing on localhost
    window.testOAuth = () => location.href = '/oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session';
}
