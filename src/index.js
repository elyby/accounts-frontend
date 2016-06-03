import 'polyfills';

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

import { factory as userFactory } from 'components/user/factory';
import { IntlProvider } from 'components/i18n';
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

userFactory(store)
.then(() => {
    // allow :active styles in mobile Safary
    document.addEventListener("touchstart", () => {}, true);

    ReactDOM.render(
        <ReduxProvider store={store}>
            <IntlProvider>
                <Router history={browserHistory} onUpdate={() => {
                    restoreScroll();
                    stopLoading();
                }}>
                    {routesFactory(store)}
                </Router>
            </IntlProvider>
        </ReduxProvider>,
        document.getElementById('app')
    );

});

import scrollTo from 'components/ui/scrollTo';
const SCROLL_ANCHOR_OFFSET = 80; // 50 + 30 (header height + some spacing)
/**
 * Scrolls to page's top or #anchor link, if any
 */
function restoreScroll() {
    const {hash} = location;

    // Push onto callback queue so it runs after the DOM is updated
    setTimeout(() => {
        const id = hash.replace('#', '');
        const el = id ? document.getElementById(id) : null;

        let y = 0;
        if (el) {
            const {scrollTop} = document.body;
            const {top} = el.getBoundingClientRect();

            y = scrollTop + top - SCROLL_ANCHOR_OFFSET;
        }

        scrollTo(y);
    }, 100);
}

function stopLoading() {
    document.getElementById('loader').classList.remove('is-active');
}

if (process.env.NODE_ENV !== 'production') {
    // some shortcuts for testing on localhost
    window.testOAuth = () => location.href = '/oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session';
    window.testOAuthStatic = () => location.href = '/oauth?client_id=ely&redirect_uri=static_page_with_code&response_type=code&scope=minecraft_server_session';
    window.testOAuthStaticCode = () => location.href = '/oauth?client_id=ely&redirect_uri=static_page&response_type=code&scope=minecraft_server_session';
}
