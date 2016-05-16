import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'components/ui/form';
import icons from 'components/ui/icons.scss';
import BaseAuthBody from 'components/auth/BaseAuthBody';

import styles from './forgotPassword.scss';
import messages from './ForgotPassword.intl.json';

export default class ForgotPasswordBody extends BaseAuthBody {
    static displayName = 'ForgotPasswordBody';
    static panelId = 'forgotPassword';
    static hasGoBack = true;

    render() {
        const { user } = this.context;
        const login = user.email || user.username;

        // TODO: нужно парсить инфу о том, какой кд у отправки кода и во сколько точно можно будет повторить

        return (
            <div>
                {this.renderErrors()}

                <div className={styles.bigIcon}>
                    <span className={icons.lock} />
                </div>

                {login ? (
                    <div>
                        <div className={styles.login}>
                            {login}
                        </div>
                        <p className={styles.descriptionText}>
                            <Message {...messages.pleasePressButton} />
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className={styles.descriptionText}>
                            <Message {...messages.specifyEmail} />
                        </p>
                        <Input {...this.bindField('email')}
                            icon="envelope"
                            color="lightViolet"
                            required
                            placeholder={messages.accountEmail}
                            defaultValue={login}
                        />
                    </div>
                )}
            </div>
        );
    }
}
