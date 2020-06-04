import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { PanelIcon } from 'app/components/ui/Panel';
import { Input } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import styles from './mfa.scss';

const messages = defineMessages({
    enterTotp: 'Enter code',
});

export default class MfaBody extends BaseAuthBody {
    static panelId = 'mfa';
    static hasGoBack = true;

    autoFocusField = 'totp';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <PanelIcon icon="lock" />

                <p className={styles.descriptionText}>
                    <Message
                        key="description"
                        defaultMessage="In order to sign in this account, you need to enter a one-time password from mobile application"
                    />
                </p>

                <Input
                    {...this.bindField('totp')}
                    icon="key"
                    required
                    placeholder={messages.enterTotp}
                    autoComplete="off"
                />
            </div>
        );
    }
}
