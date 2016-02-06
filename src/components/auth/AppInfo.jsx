import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import buttons from 'components/ui/buttons.scss';

import styles from './appInfo.scss';
import messages from './AppInfo.messages';

export default class AppInfo extends Component {
    static displayName = 'AppInfo';

    static propTypes = {
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        onGoToAuth: PropTypes.func.isRequired
    };

    render() {
        var { name, description, onGoToAuth } = this.props;

        return (
            <div className={styles.appInfo}>
                <div className={styles.logoContainer}>
                    <h2 className={styles.logo}>{name}</h2>
                </div>
                <div className={styles.descriptionContainer}>
                    <p className={styles.description}>
                        {description}
                    </p>
                </div>
                <div className={styles.goToAuth}>
                    <button className={buttons.green} onClick={onGoToAuth}>
                        <Message {...messages.goToAuth} />
                    </button>
                </div>
            </div>
        );
    }
}
