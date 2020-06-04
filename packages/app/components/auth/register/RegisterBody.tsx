import React from 'react';
import { defineMessages, FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';
import { Input, Checkbox, Captcha } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import styles from '../auth.scss';

// TODO: password and username can be validate for length and sameness

const placeholders = defineMessages({
    yourNickname: 'Your nickname',
    yourEmail: 'Your E‑mail',
    accountPassword: 'Account password',
    repeatPassword: 'Repeat password',
});

export default class RegisterBody extends BaseAuthBody {
    static panelId = 'register';

    autoFocusField = 'username';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <Input
                    {...this.bindField('username')}
                    icon="user"
                    color="blue"
                    type="text"
                    required
                    placeholder={placeholders.yourNickname}
                />

                <Input
                    {...this.bindField('email')}
                    icon="envelope"
                    color="blue"
                    type="email"
                    required
                    placeholder={placeholders.yourEmail}
                />

                <Input
                    {...this.bindField('password')}
                    icon="key"
                    color="blue"
                    type="password"
                    required
                    placeholder={placeholders.accountPassword}
                />

                <Input
                    {...this.bindField('rePassword')}
                    icon="key"
                    color="blue"
                    type="password"
                    required
                    placeholder={placeholders.repeatPassword}
                />

                <Captcha {...this.bindField('captcha')} delay={600} />

                <div className={styles.checkboxInput}>
                    <Checkbox
                        {...this.bindField('rulesAgreement')}
                        color="blue"
                        required
                        label={
                            <Message
                                key="acceptRules"
                                defaultMessage="I agree with {link}"
                                values={{
                                    link: (
                                        <Link to="/rules" target="_blank">
                                            <Message key="termsOfService" defaultMessage="terms of service" />
                                        </Link>
                                    ),
                                }}
                            />
                        }
                    />
                </div>
            </div>
        );
    }
}
