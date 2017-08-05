// @flow
import React, { Component } from 'react';

import { FooterMenu } from 'components/footerMenu';

import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import styles from './success-oauth.scss';
import rootMessages from 'pages/root/RootPage.intl.json';
import messages from './SuccessOauthPage.intl.json';

import profileStyles from 'pages/profile/profile.scss';

export default class SuccessOauthPage extends Component {
    props: {
        appName: ?string
    };

    render() {
        // TODO: detect GET param `appName`
        // TODO: попытаться заркыть окно с помощью https://stackoverflow.com/a/31163281/5184751
        const {appName} = this.props;

        return (
            <div className={styles.page}>
                <Message {...messages.title}>
                    {(pageTitle) => (
                        <Helmet title={pageTitle}/>
                    )}
                </Message>

                <div className={styles.wrapper}>
                    <Link to="/" className={styles.logo}>
                        <Message {...rootMessages.siteName} />
                    </Link>

                    <div className={styles.title}>
                        <Message {...messages.applicationAuth} />
                    </div>

                    <div className={styles.checkmark} />

                    <div className={styles.description}>
                        {appName ? (
                            <Message {...messages.authorizationForAppSuccessful} values={{
                                appName: <b>{appName}</b>
                            }} />
                        ) : (
                            <Message {...messages.authorizationSuccessful} />
                        )}
                        &nbsp;
                        <Message {...messages.youCanCloseThisPage} />
                    </div>
                </div>

                <div className={profileStyles.footer}>
                    <FooterMenu/>
                </div>
            </div>
        );
    }
}
