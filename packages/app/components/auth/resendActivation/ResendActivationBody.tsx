import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Input, Captcha } from 'app/components/ui/form';

import BaseAuthBody from '../BaseAuthBody';
import styles from './resendActivation.scss';

const placeholders = defineMessages({
    yourEmail: 'Your E‑mail',
});

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
                    <Message
                        key="specifyYourEmail"
                        defaultMessage="Please, enter an E‑mail you've registered with and we will send you new activation code"
                    />
                </div>

                <Input
                    {...this.bindField('email')}
                    icon="envelope"
                    color="blue"
                    type="email"
                    required
                    placeholder={placeholders.yourEmail}
                    defaultValue={this.context.user.email}
                />

                <Captcha {...this.bindField('captcha')} delay={600} />
            </div>
        );
    }
}
