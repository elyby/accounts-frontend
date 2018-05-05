// @flow
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { FooterMenu } from 'components/footerMenu';

import styles from './dev.scss';
import ApplicationsListPage from './ApplicationsListPage';
import CreateNewApplicationPage from './CreateNewApplicationPage';
import UpdateApplicationPage from './UpdateApplicationPage';

export default function DevPage() {
    return (
        <div className={styles.container}>
            <Switch>
                <Route path="/dev/applications" exact component={ApplicationsListPage} />
                <Route path="/dev/applications/new" exact component={CreateNewApplicationPage} />
                <Route path="/dev/applications/:clientId" component={UpdateApplicationPage} />
                <Redirect to="/dev/applications" />
            </Switch>

            <div className={styles.footer}>
                <FooterMenu />
            </div>
        </div>
    );
}
