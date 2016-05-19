import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Button } from 'components/ui/form';

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
                    <p className={styles.description}>
                        {description}
                    </p>
                </div>
                <div className={styles.goToAuth}>
                    <Button onClick={onGoToAuth} label={messages.goToAuth} />
                </div>
            </div>
        );
    }
}
