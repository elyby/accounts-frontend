// @flow
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { FooterMenu } from 'components/footerMenu';
import PrivateRoute from 'containers/PrivateRoute';

import styles from './dev.scss';
import ApplicationsListPage from './ApplicationsListPage';
import CreateNewApplicationPage from './CreateNewApplicationPage';
import UpdateApplicationPage from './UpdateApplicationPage';

export default function DevPage() {
  return (
    <div className={styles.container}>
      <div data-e2e-content>
        <Switch>
          <Route
            path="/dev/applications"
            exact
            component={ApplicationsListPage}
          />
          <PrivateRoute
            path="/dev/applications/new"
            exact
            component={CreateNewApplicationPage}
          />
          <PrivateRoute
            path="/dev/applications/:clientId"
            component={UpdateApplicationPage}
          />
          <Redirect to="/dev/applications" />
        </Switch>
      </div>

      <div className={styles.footer}>
        <FooterMenu />
      </div>
    </div>
  );
}
