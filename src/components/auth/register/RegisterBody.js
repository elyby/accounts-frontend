import React from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { Link } from 'react-router-dom';

import { Input, Checkbox, Captcha } from 'components/ui/form';
import BaseAuthBody from 'components/auth/BaseAuthBody';
import passwordMessages from 'components/auth/password/Password.intl.json';

import styles from 'components/auth/auth.scss';
import messages from './Register.intl.json';

// TODO: password and username can be validate for length and sameness

export default class RegisterBody extends BaseAuthBody {
    static displayName = 'RegisterBody';
    static panelId = 'register';

    autoFocusField = 'username';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <Input {...this.bindField('username')}
                    icon="user"
                    color="blue"
                    type="text"
                    required
                    placeholder={messages.yourNickname}
                />

                <Input {...this.bindField('email')}
                    icon="envelope"
                    color="blue"
                    type="email"
                    required
                    placeholder={messages.yourEmail}
                />

                <Input {...this.bindField('password')}
                    icon="key"
                    color="blue"
                    type="password"
                    required
                    placeholder={passwordMessages.accountPassword}
                />

                <Input {...this.bindField('rePassword')}
                    icon="key"
                    color="blue"
                    type="password"
                    required
                    placeholder={messages.repeatPassword}
                />

                <Captcha {...this.bindField('captcha')} delay={600} />

                <div className={styles.checkboxInput}>
                    <Checkbox {...this.bindField('rulesAgreement')}
                        color="blue"
                        required
                        label={
                            <Message {...messages.acceptRules} values={{
                                link: (
                                    <Link to="/rules" target="_blank">
                                        <Message {...messages.termsOfService} />
                                    </Link>
                                )
                            }} />
                        }
                    />
                </div>
            </div>
        );
    }
}
