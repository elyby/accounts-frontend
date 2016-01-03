import React, { Component } from 'react';

import { Link } from 'react-router';
import { FormattedMessage as Message } from 'react-intl';

import messages from './UserBar.messages.js';

export default class UserBar extends Component {
    render() {
        return (
            <div>
                <Link to="/register">
                    <Message {...messages.register} />
                </Link>
            </div>
        );
    }
}
