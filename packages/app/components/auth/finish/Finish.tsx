import React, { MouseEventHandler } from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet-async';

import { connect } from 'app/functions';
import { Button } from 'app/components/ui/form';
import copy from 'app/services/copy';

import styles from './finish.scss';

const messages = defineMessages({
    copy: 'Copy',
});

interface Props {
    appName: string;
    code?: string;
    state: string;
    displayCode?: boolean;
    success?: boolean;
}

class Finish extends React.Component<Props> {
    render() {
        const { appName, code, state, displayCode, success } = this.props;
        const authData = JSON.stringify({
            auth_code: code,
            state,
        });

        history.pushState(null, document.title, `#${authData}`);

        return (
            <div className={styles.finishPage}>
                <Helmet title={authData} />

                {success ? (
                    <div>
                        <div className={styles.successBackground} />
                        <div className={styles.greenTitle}>
                            <Message
                                key="authForAppSuccessful"
                                defaultMessage="Authorization for {appName} was successfully completed"
                                values={{
                                    appName: <span className={styles.appName}>{appName}</span>,
                                }}
                            />
                        </div>
                        {displayCode ? (
                            <div data-testid="oauth-code-container">
                                <div className={styles.description}>
                                    <Message
                                        key="passCodeToApp"
                                        defaultMessage="To complete authorization process, please, provide the following code to {appName}"
                                        values={{ appName }}
                                    />
                                </div>
                                <div className={styles.codeContainer}>
                                    <div className={styles.code}>{code}</div>
                                </div>
                                <Button color="green" small label={messages.copy} onClick={this.onCopyClick} />
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
                                    appName: <span className={styles.appName}>{appName}</span>,
                                }}
                            />
                        </div>
                        <div className={styles.description}>
                            <Message
                                key="waitAppReaction"
                                defaultMessage="Please, wait till your application response"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    onCopyClick: MouseEventHandler = (event) => {
        event.preventDefault();

        const { code } = this.props;

        if (code) {
            copy(code);
        }
    };
}

export default connect(({ auth }) => {
    if (!auth || !auth.client || !auth.oauth) {
        throw new Error('Can not connect Finish component. No auth data in state');
    }

    return {
        appName: auth.client.name,
        code: auth.oauth.code,
        displayCode: auth.oauth.displayCode,
        state: auth.oauth.state,
        success: auth.oauth.success,
    };
})(Finish);
