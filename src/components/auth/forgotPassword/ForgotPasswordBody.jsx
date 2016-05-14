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

    autoFocusField = 'email';

    // Если юзер вводил своё мыло во время попытки авторизации, то почему бы его сюда автоматически не подставить?
    render() {
        const {user} = this.context;

        return (
            <div>
                {this.renderErrors()}

                <p className={styles.descriptionText}>
                    <Message {...messages.forgotPasswordMessage} />
                </p>

                <Input {...this.bindField('email')}
                    icon="envelope"
                    color="lightViolet"
                    required
                    placeholder={messages.accountEmail}
                    defaultValue={user.email || user.username || ''}
                />
            </div>
        );
    }
}
