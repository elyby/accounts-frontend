import React, { Component } from 'react';

import { Link } from 'react-router';
import { FormattedMessage as Message } from 'react-intl';

import buttons from 'components/ui/buttons.scss';

import messages from './Userbar.messages.js';
import styles from './userbar.scss';

export default class Userbar extends Component {
    render() {
        return (
            <div className={styles.userbar}>
                <Link to="/register" className={buttons.blue}>
                    <Message {...messages.register} />
                </Link>
                <Link to="/oauth/permissions" className={buttons.blue}>
                    Test oAuth
                </Link>
            </div>
        );
    }
}
