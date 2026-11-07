import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';

import { useReduxSelector } from 'app/functions';

import styles from './finish.scss';

interface Props {
    appName: string;
    success: boolean;
}

export const FinishResult: FC<Props> = ({ appName, success }) => (
    <div className={styles.finishPage}>
        {success ? (
            <>
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
                <div className={styles.description}>
                    <Message key="waitAppReaction" defaultMessage="Please, wait till your application response" />
                </div>
            </>
        ) : (
            <>
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
                    <Message key="waitAppReaction" defaultMessage="Please, wait till your application response" />
                </div>
            </>
        )}
    </div>
);

const Finish: FC = () => {
    const { client, oauth } = useReduxSelector((state) => state.auth);

    if (!client || !oauth) {
        return <Redirect to="/" />;
    }

    return <FinishResult appName={client.name} success={Boolean(oauth.success)} />;
};

export default Finish;
