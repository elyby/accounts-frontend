import React from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import { Link } from 'react-router';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Input, Checkbox } from 'components/ui/Form';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import styles from './password.scss';
import messages from './Password.messages';

class Body extends BaseAuthBody {
    static displayName = 'PasswordBody';
    static panelId = 'password';
    static hasGoBack = true;

    render() {
        const {user} = this.context;

        return (
            <div>
                {this.renderErrors()}

                <div className={styles.miniProfile}>
                    <div className={styles.avatar}>
                        {user.avatar
                            ? <img src={user.avatar} />
                            : <span className={icons.user} />
                        }
                    </div>
                    <div className={styles.email}>
                        {user.email || user.username}
                    </div>
                </div>
                <Input {...this.bindField('password')}
                    icon="key"
                    type="password"
                    autoFocus
                    onFocus={this.fixAutoFocus}
                    required
                    placeholder={messages.accountPassword}
                />

                <Checkbox {...this.bindField('rememberMe')} label={<Message {...messages.rememberMe} />} />
            </div>
        );
    }
}

export default function Password() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.passwordTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.green} type="submit">
                <Message {...messages.signInButton} />
            </button>
        ),
        Links: () => (
            <Link to="/forgot-password">
                <Message {...messages.forgotPassword} />
            </Link>
        )
    };
}
