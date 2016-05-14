import React from 'react';

import icons from 'components/ui/icons.scss';
import { Input, Checkbox } from 'components/ui/form';
import BaseAuthBody from 'components/auth/BaseAuthBody';

import styles from './password.scss';
import messages from './Password.intl.json';

export default class PasswordBody extends BaseAuthBody {
    static displayName = 'PasswordBody';
    static panelId = 'password';
    static hasGoBack = true;

    autoFocusField = 'password';

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
                    required
                    placeholder={messages.accountPassword}
                />

                <Checkbox {...this.bindField('rememberMe')}
                    defaultChecked={true}
                    label={messages.rememberMe}
                />
            </div>
        );
    }
}
