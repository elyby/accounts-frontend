import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, combineReducers } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';

import { Router, browserHistory } from 'react-router';
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router';

import { IntlProvider } from 'react-intl';

import reducers from 'reducers';
import routes from 'routes';

const reducer = combineReducers({
    ...reducers,
    routing: routeReducer
});
const store = createStore(reducer);

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
