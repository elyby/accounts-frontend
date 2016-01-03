import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { Link } from 'react-router';

import { FormattedMessage } from 'react-intl';

import styles from 'index.scss';

function CoreLayout(props) {
    return (
        <div>
            <FormattedMessage
                id="greeting"
                description="Welcome greeting to the user"
                defaultMessage="Hello, {name}! How are you today?"
                values={{name: 'World'}}
            />

            {props.children}
        </div>
    );
}

function HomeView() {
    return (
        <div>
            Home!
            <Link className={styles.testClass} to="/auth">Auth</Link>
        </div>
    );
}

function AuthView() {
    return (
        <div>
            Auth!
            <Link to="/">Home</Link>
        </div>
    );
}

export default (
  <Route path="/" component={CoreLayout}>
    <IndexRoute component={HomeView} />
    <Route path="/auth" component={AuthView} />
  </Route>
);
