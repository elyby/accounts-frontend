import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'components/ui/form';
import BaseAuthBody from 'components/auth/BaseAuthBody';

import styles from './forgotPassword.scss';
import messages from './ForgotPassword.intl.json';

export default class ForgotPasswordBody extends BaseAuthBody {
    static displayName = 'ForgotPasswordBody';
    static panelId = 'forgotPassword';
    static hasGoBack = true;

    render() {
        const {user} = this.context;
        const hasIdentity = user.email || user.username;
        const message = hasIdentity ? messages.pleasePressButton : messages.specifyEmail;

        return (
            <div>
                {this.renderErrors()}

                <p className={styles.descriptionText}>
                    <Message {...message} />
                </p>

                {hasIdentity ? null : (
                    <Input {...this.bindField('email')}
                        icon="envelope"
                        color="lightViolet"
                        required
                        placeholder={messages.accountEmail}
                        defaultValue={user.email || user.username}
                    />
                )}

            </div>
        );
    }
}
