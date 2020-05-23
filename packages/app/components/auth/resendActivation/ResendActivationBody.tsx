import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Input, Captcha } from 'app/components/ui/form';

import BaseAuthBody from '../BaseAuthBody';
import registerMessages from '../register/Register.intl.json';
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

                <Input
                    {...this.bindField('email')}
                    icon="envelope"
                    color="blue"
                    type="email"
                    required
                    placeholder={registerMessages.yourEmail}
                    defaultValue={this.context.user.email}
                />

                <Captcha {...this.bindField('captcha')} delay={600} />
            </div>
        );
    }
}
