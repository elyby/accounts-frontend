import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';

import buttons from 'components/ui/buttons.scss';

import messages from './Userbar.intl.json';
import styles from './userbar.scss';

import { userShape } from 'components/user/User';

import LoggedInPanel from './LoggedInPanel';

export default class Userbar extends Component {
    static displayName = 'Userbar';
    static propTypes = {
        user: userShape,
        guestAction: PropTypes.oneOf(['register', 'login'])
    };

    static defaultProps = {
        guestAction: 'register'
    };

    render() {
        const { user } = this.props;
        let { guestAction } = this.props;

        switch (guestAction) {
            case 'login':
                guestAction = (
                    <Link to="/login" className={buttons.blue}>
                        <Message {...messages.login} />
                    </Link>
                );
                break;
            case 'register':
            default:
                guestAction = (
                    <Link to="/register" className={buttons.blue}>
                        <Message {...messages.register} />
                    </Link>
                );
                break;
        }

        return (
            <div className={styles.userbar}>
                {user.isGuest
                    ? (
                        guestAction
                    )
                    : (
                        <LoggedInPanel {...this.props} />
                    )
                }
            </div>
        );
    }
}
