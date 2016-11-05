import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';

import buttons from 'components/ui/buttons.scss';
import { AccountSwitcher } from 'components/accounts';

import styles from './loggedInPanel.scss';

import { userShape } from 'components/user/User';

export default class LoggedInPanel extends Component {
    static displayName = 'LoggedInPanel';
    static propTypes = {
        user: userShape,
        onLogout: PropTypes.func.isRequired
    };

    render() {
        const { user } = this.props;

        return (
            <div className={classNames(styles.loggedInPanel)}>
                {/* this button must be a div, because some browsers force overflow hidden on button elements */}
                <div className={classNames(buttons.green, styles.activeAccount)}>
                    <span className={styles.userIcon} />
                    <span className={styles.userName}>{user.username}</span>
                    <span className={styles.expandIcon} />

                    <div className={classNames(styles.accountSwitcherContainer)}>
                        <AccountSwitcher />
                    </div>
                </div>
            </div>
        );
    }

    onLogout = (event) => {
        event.preventDefault();

        this.props.onLogout();
    };
}
