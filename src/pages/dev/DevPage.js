// @flow
import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import styles from './dev.scss';

import ApplicationsListPage from './ApplicationsListPage';
import CreateNewApplicationPage from './CreateNewApplicationPage';
import UpdateApplicationPage from './UpdateApplicationPage';

import { FooterMenu } from 'components/footerMenu';

export default class DevPage extends Component<{}> {
    render() {
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
}
