// @flow
import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import loader from 'services/loader';
import rootMessages from 'pages/root/RootPage.intl.json';

import styles from './success-oauth.scss';
import messages from './SuccessOauthPage.intl.json';

import type { Query } from 'services/request';

export default class SuccessOauthPage extends Component<{
  location: {
    query: Query<'appName'>,
  },
}> {
  componentDidMount() {
    this.onPageUpdate();

    setTimeout(() => {
      try {
        // try to close window if possible
        window.open('', '_self').close();
      } catch (err) {
        // don't care
      }
    }, 8000);
  }

  componentDidUpdate() {
    this.onPageUpdate();
  }

  onPageUpdate() {
    loader.hide();
  }

  render() {
    const appName = this.props.location.query.get('appName');

    return (
      <div className={styles.page}>
        <Message {...messages.title}>
          {pageTitle => <Helmet title={pageTitle} />}
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
              <Message
                {...messages.authorizationForAppSuccessful}
                values={{
                  appName: <b>{appName}</b>,
                }}
              />
            ) : (
              <Message {...messages.authorizationSuccessful} />
            )}
            &nbsp;
            <Message {...messages.youCanCloseThisPage} />
          </div>
        </div>
      </div>
    );
  }
}
