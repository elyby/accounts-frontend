import React from 'react';
import icons from 'app/components/ui/icons.scss';
import { Input, Checkbox } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';
import authStyles from 'app/components/auth/auth.scss';
import { defineMessages } from 'react-intl';

import styles from './password.scss';

const messages = defineMessages({
    accountPassword: 'Account password',
    rememberMe: 'Remember me on this device',
});

export default class PasswordBody extends BaseAuthBody {
    static displayName = 'PasswordBody';
    static panelId = 'password';
    static hasGoBack = true;

    autoFocusField = 'password';

    render() {
        const { user } = this.context;

        return (
            <div>
                {this.renderErrors()}

                <div className={styles.miniProfile}>
                    <div className={styles.avatar}>
                        {user.avatar ? <img src={user.avatar} /> : <span className={icons.user} />}
                    </div>
                    <div className={styles.email}>{user.email || user.username}</div>
                </div>

                <Input
                    {...this.bindField('password')}
                    icon="key"
                    type="password"
                    required
                    placeholder={messages.accountPassword}
                />

                <div className={authStyles.checkboxInput}>
                    <Checkbox {...this.bindField('rememberMe')} defaultChecked label={messages.rememberMe} />
                </div>
            </div>
        );
    }
}
