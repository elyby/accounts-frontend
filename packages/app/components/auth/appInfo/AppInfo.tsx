import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Button } from 'app/components/ui/form';
import { FooterMenu } from 'app/components/footerMenu';

import appName from './appName.intl';
import styles from './appInfo.scss';

const messages = defineMessages({
    goToAuth: 'Go to auth',
});

export default class AppInfo extends React.Component<{
    name?: string;
    description?: string;
    onGoToAuth: () => void;
}> {
    render() {
        const { name, description, onGoToAuth } = this.props;

        return (
            <div className={styles.appInfo}>
                <div className={styles.logoContainer}>
                    <h2 className={styles.logo}>{name ? name : <Message {...appName} />}</h2>
                </div>
                <div className={styles.descriptionContainer}>
                    {description ? (
                        <p className={styles.description}>{description}</p>
                    ) : (
                        <div>
                            <p className={styles.description}>
                                <Message
                                    key="appDescription"
                                    defaultMessage="You are on the Ely.by authorization service, that allows you to safely perform any operations on your account. This single entry point for websites and desktop software, including game launchers."
                                />
                            </p>
                            <p className={styles.description}>
                                <Message
                                    key="useItYourself"
                                    defaultMessage="Visit our {link}, to learn how to use this service in you projects."
                                    values={{
                                        link: (
                                            <a href="http://docs.ely.by/oauth.html">
                                                <Message key="documentation" defaultMessage="documentation" />
                                            </a>
                                        ),
                                    }}
                                />
                            </p>
                        </div>
                    )}
                </div>
                <div className={styles.goToAuth}>
                    <Button onClick={onGoToAuth} label={messages.goToAuth} />
                </div>

                <div className={styles.footer}>
                    <FooterMenu />
                </div>
            </div>
        );
    }
}
