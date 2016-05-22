import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router';
import { intlShape } from 'react-intl';

import buttons from 'components/ui/buttons.scss';
import buttonGroups from 'components/ui/button-groups.scss';

import messages from './LoggedInPanel.intl.json';
import styles from './loggedInPanel.scss';

import { userShape } from 'components/user/User';

export default class LoggedInPanel extends Component {
    static displayName = 'LoggedInPanel';
    static propTypes = {
        user: userShape,
        onLogout: PropTypes.func.isRequired
    };

    static contextTypes = {
        intl: intlShape.isRequired
    };

    render() {
        const { user } = this.props;

        return (
            <div className={buttonGroups.horizontalGroup}>
                <Link to="/" className={classNames(buttons.green, buttonGroups.item)}>
                    <span className={styles.userIcon} />
                    <span className={styles.userName}>{user.username}</span>
                </Link>
                <button
                    onClick={this.onLogout}
                    className={classNames(buttons.green, buttonGroups.item)}
                    title={this.context.intl.formatMessage(messages.logout)}
                >
                    <span className={styles.logoutIcon} />
                </button>
            </div>
        );
    }

    onLogout = (event) => {
        event.preventDefault();

        this.props.onLogout();
    };
}
