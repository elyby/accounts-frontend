import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'components/ui/form';
import registerMessages from 'components/auth/register/Register.intl.json';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import styles from './resendActivation.scss';
import messages from './ResendActivation.intl.json';

export default class ResendActivation extends BaseAuthBody {
    static displayName = 'ResendActivation';
    static panelId = 'resendActivation';
    static hasGoBack = true;

    autoFocusField = 'email';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <div className={styles.description}>
                    <Message {...messages.specifyYourEmail} />
                </div>

                <div className={styles.formRow}>
                    <Input {...this.bindField('email')}
                        icon="envelope"
                        color="blue"
                        type="email"
                        required
                        placeholder={registerMessages.yourEmail}
                        defaultValue={this.context.user.email}
                    />
                </div>
            </div>
        );
    }
}
