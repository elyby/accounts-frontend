import React from 'react';

import { defineMessages, FormattedMessage as Message } from 'react-intl';

import { Input, Captcha } from 'app/components/ui/form';
import { getLogin } from 'app/components/auth/reducer';
import { PanelIcon } from 'app/components/ui/Panel';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import styles from './forgotPassword.scss';

const messages = defineMessages({
    emailOrUsername: 'E‑mail or username',
});

export default class ForgotPasswordBody extends BaseAuthBody {
    static displayName = 'ForgotPasswordBody';
    static panelId = 'forgotPassword';
    static hasGoBack = true;

    state = {
        isLoginEdit: false,
    };

    autoFocusField = 'login';

    render() {
        const { isLoginEdit } = this.state;

        const login = this.getLogin();
        const isLoginEditShown = isLoginEdit || !login;

        return (
            <div>
                {this.renderErrors()}

                <PanelIcon icon="lock" />

                {isLoginEditShown ? (
                    <div>
                        <p className={styles.descriptionText}>
                            <Message
                                key="specifyEmail"
                                defaultMessage="Specify the registration E‑mail address or last used username for your account and we will send an E‑mail with instructions for further password recovery."
                            />
                        </p>
                        <Input
                            {...this.bindField('login')}
                            icon="envelope"
                            color="lightViolet"
                            required
                            placeholder={messages.emailOrUsername}
                            defaultValue={login}
                        />
                    </div>
                ) : (
                    <div data-testid="forgot-password-login">
                        <div className={styles.login}>
                            {login}
                            <span className={styles.editLogin} onClick={this.onClickEdit} data-testid="edit-login" />
                        </div>
                        <p className={styles.descriptionText}>
                            <Message
                                key="pleasePressButton"
                                defaultMessage="Please press the button bellow to get an E‑mail with password recovery code."
                            />
                        </p>
                    </div>
                )}

                <Captcha {...this.bindField('captcha')} delay={600} />
            </div>
        );
    }

    serialize() {
        const data = super.serialize();

        if (!data.login) {
            data.login = this.getLogin();
        }

        return data;
    }

    getLogin() {
        const login = getLogin(this.context);
        const { user } = this.context;

        return login || user.username || user.email || '';
    }

    onClickEdit = async () => {
        this.setState({
            isLoginEdit: true,
        });

        await this.context.requestRedraw();

        this.form.focus('login');
    };
}
