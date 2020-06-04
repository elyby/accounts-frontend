import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import * as loader from 'app/services/loader';
import { Query } from 'app/services/request';

import siteName from 'app/pages/root/siteName.intl';
import styles from './success-oauth.scss';

export default class SuccessOauthPage extends React.Component<{
    location: {
        query: Query<'appName'>;
    };
}> {
    componentDidMount() {
        this.onPageUpdate();

        setTimeout(() => {
            try {
                // try to close window if possible
                // @ts-ignore
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
                <Message key="title" defaultMessage="Authorization successful">
                    {(pageTitle) => <Helmet title={pageTitle as string} />}
                </Message>

                <div className={styles.wrapper}>
                    <Link to="/" className={styles.logo}>
                        <Message {...siteName} />
                    </Link>

                    <div className={styles.title}>
                        <Message key="applicationAuth" defaultMessage="Application authorization" />
                    </div>

                    <div className={styles.checkmark} />

                    <div className={styles.description}>
                        {appName ? (
                            <Message
                                key="authorizationForAppSuccessful"
                                defaultMessage="Authorization for {appName} has been successfully completed."
                                values={{
                                    appName: <b>{appName}</b>,
                                }}
                            />
                        ) : (
                            <Message
                                key="authorizationSuccessful"
                                defaultMessage="Authorization has been successfully completed."
                            />
                        )}
                        &nbsp;
                        <Message
                            key="youCanCloseThisPage"
                            defaultMessage="You can close this window and return to your application."
                        />
                    </div>
                </div>
            </div>
        );
    }
}
