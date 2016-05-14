import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'components/ui/form';
import icons from 'components/ui/icons.scss';
import BaseAuthBody from 'components/auth/BaseAuthBody';

import styles from './changePassword.scss';
import messages from './ChangePassword.intl.json';

export default class ChangePasswordBody extends BaseAuthBody {
    static displayName = 'ChangePasswordBody';
    static panelId = 'changePassword';

    autoFocusField = 'password';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <div className={styles.security}>
                    <span className={icons.lock} />
                </div>

                <p className={styles.descriptionText}>
                    <Message {...messages.changePasswordMessage} />
                </p>

                <Input {...this.bindField('password')}
                    icon="key"
                    color="darkBlue"
                    type="password"
                    required
                    placeholder={messages.currentPassword}
                />

                <Input {...this.bindField('newPassword')}
                    icon="key"
                    color="darkBlue"
                    type="password"
                    required
                    placeholder={messages.newPassword}
                />

                <Input {...this.bindField('newRePassword')}
                    icon="key"
                    color="darkBlue"
                    type="password"
                    required
                    placeholder={messages.newRePassword}
                />
            </div>
        );
    }
}
