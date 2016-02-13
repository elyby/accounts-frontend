import React, { Component } from 'react';

import { Link } from 'react-router';
import { FormattedMessage as Message } from 'react-intl';

import buttons from 'components/ui/buttons.scss';

import messages from './Userbar.messages.js';
import styles from './userbar.scss';

import { userShape } from 'components/user/User';

export default class Userbar extends Component {
    static displayName = 'Userbar';
    static propTypes = {
        user: userShape
    };

    render() {
        const { user } = this.props;

        return (
            <div className={styles.userbar}>
                {user.isGuest
                    ? (
                        <Link to="/register" className={buttons.blue}>
                            <Message {...messages.register} />
                        </Link>
                    )
                    : (
                        <Link to="/logout" className={buttons.blue}>
                            <Message {...messages.logout} />
                        </Link>
                    )
                }
            </div>
        );
    }
}
