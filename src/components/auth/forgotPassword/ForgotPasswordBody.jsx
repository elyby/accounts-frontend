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

    state = {
        isLoginEdit: !this.getLogin()
    };

    autoFocusField = this.state.isLoginEdit ? 'email' : null;

    render() {
        const login = this.getLogin();
        const isLoginEditShown = this.state.isLoginEdit;

        return (
            <div>
                {this.renderErrors()}

                <div className={styles.bigIcon}>
                    <span className={icons.lock} />
                </div>

                {isLoginEditShown ? (
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
                ) : (
                    <div>
                        <div className={styles.login}>
                            {login}
                            <span className={styles.editLogin} onClick={this.onClickEdit} />
                        </div>
                        <p className={styles.descriptionText}>
                            <Message {...messages.pleasePressButton} />
                        </p>
                    </div>
                )}
            </div>
        );
    }

    serialize() {
        const data = super.serialize();

        if (!data.email) {
            data.email = this.getLogin();
        }

        return data;
    }

    getLogin() {
        const { user, auth } = this.context;

        return auth.login || user.username || user.email || '';
    }

    onClickEdit = () => {
        this.setState({
            isLoginEdit: true
        });
        this.context.requestRedraw();
        // TODO: requestRedraw должен возвращать promise, по которому нужно ставить фокус на поле
        // иначе же, если фокус ставить сразу, то форма скачет
        setTimeout(() => {this.form.focus('email');}, 300);
    };
}
