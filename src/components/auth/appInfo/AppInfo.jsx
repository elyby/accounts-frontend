import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Button } from 'components/ui/form';
import { LangMenu } from 'components/langMenu';
import { FooterMenu } from 'components/footerMenu';

import styles from './appInfo.scss';
import messages from './AppInfo.intl.json';

export default class AppInfo extends Component {
    static displayName = 'AppInfo';

    static propTypes = {
        name: PropTypes.string,
        description: PropTypes.string,
        onGoToAuth: PropTypes.func.isRequired
    };

    render() {
        const { name, description, onGoToAuth } = this.props;

        return (
            <div className={styles.appInfo}>
                <div className={styles.logoContainer}>
                    <h2 className={styles.logo}>
                        {name ? name : (
                            <Message {...messages.appName} />
                        )}
                    </h2>
                </div>
                <div className={styles.descriptionContainer}>
                    {description ? (
                        <p className={styles.description}>
                            {description}
                        </p>
                    ) : (
                        <div>
                            <p className={styles.description}>
                                <Message {...messages.appDescription} />
                            </p>
                            <p className={styles.description}>
                                <Message {...messages.useItYourself} values={{
                                    link: (
                                        <a href="http://docs.ely.by/oauth.html">
                                            <Message {...messages.documentation} />
                                        </a>
                                    )
                                }} />
                            </p>
                        </div>
                    )}
                </div>
                <div className={styles.goToAuth}>
                    <Button onClick={onGoToAuth} label={messages.goToAuth} />
                </div>

                <div className={styles.langMenu}>
                    <FooterMenu skin="light" />
                    <LangMenu />
                </div>
            </div>
        );
    }
}
