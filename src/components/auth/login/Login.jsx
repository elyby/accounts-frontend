import React from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import { Link } from 'react-router';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/form';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import passwordMessages from 'components/auth/password/Password.messages';
import messages from './Login.messages';

class Body extends BaseAuthBody {
    static displayName = 'LoginBody';
    static panelId = 'login';

    autoFocusField = 'login';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <Input {...this.bindField('login')}
                    icon="envelope"
                    required
                    placeholder={messages.emailOrUsername}
                />
            </div>
        );
    }
}

export default function Login() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.loginTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.green} type="submit">
                <Message {...messages.next} />
            </button>
        ),
        Links: () => (
            <Link to="/forgot-password">
                <Message {...passwordMessages.forgotPassword} />
            </Link>
        )
    };
}
