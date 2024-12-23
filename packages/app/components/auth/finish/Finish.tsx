import React, { FC, MouseEventHandler, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';

import { useReduxSelector } from 'app/functions';
import { Button } from 'app/components/ui/form';
import copy from 'app/services/copy';

import styles from './finish.scss';

interface Props {
    appName: string;
    code?: string;
    state: string;
    displayCode?: boolean;
    success?: boolean;
}

const Finish: FC<Props> = () => {
    const { client, oauth } = useReduxSelector((state) => state.auth);

    const onCopyClick: MouseEventHandler = (event) => {
        event.preventDefault();
        copy(oauth!.code!);
    };

    let authData: string | undefined;

    if (oauth && 'state' in oauth.params) {
        authData = JSON.stringify({
            auth_code: oauth.code,
            state: oauth.params.state,
        });
    }

    useEffect(() => {
        if (authData) {
            history.pushState(null, document.title, `#${authData}`);
        }
    }, []);

    if (!client || !oauth) {
        return <Redirect to="/" />;
    }

    return (
        <div className={styles.finishPage}>
            {authData && <Helmet title={authData} />}

            {oauth.success ? (
                <div>
                    <div className={styles.successBackground} />
                    <div className={styles.greenTitle}>
                        <Message
                            key="authForAppSuccessful"
                            defaultMessage="Authorization for {appName} was successfully completed"
                            values={{
                                appName: <span className={styles.appName}>{client.name}</span>,
                            }}
                        />
                    </div>
                    {oauth.displayCode ? (
                        <div data-testid="oauth-code-container">
                            <div className={styles.description}>
                                <Message
                                    key="passCodeToApp"
                                    defaultMessage="To complete authorization process, please, provide the following code to {appName}"
                                    values={{ appName: client.name }}
                                />
                            </div>
                            <div className={styles.codeContainer}>
                                <div className={styles.code}>{oauth.code}</div>
                            </div>
                            <Button color="green" small onClick={onCopyClick}>
                                <Message key="copy" defaultMessage="Copy" />
                            </Button>
                        </div>
                    ) : (
                        <div className={styles.description}>
                            <Message
                                key="waitAppReaction"
                                defaultMessage="Please, wait till your application response"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className={styles.failBackground} />
                    <div className={styles.redTitle}>
                        <Message
                            key="authForAppFailed"
                            defaultMessage="Authorization for {appName} was failed"
                            values={{
                                appName: <span className={styles.appName}>{client.name}</span>,
                            }}
                        />
                    </div>
                    <div className={styles.description}>
                        <Message key="waitAppReaction" defaultMessage="Please, wait till your application response" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finish;
