import React from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/Form';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import messages from './ForgotPassword.messages';

import styles from './forgotPassword.scss';

class Body extends BaseAuthBody {
    static displayName = 'ForgotPasswordBody';
    static panelId = 'forgotPassword';
    static hasGoBack = true;

    // Если юзер вводил своё мыло во время попытки авторизации, то почему бы его сюда автоматически не подставить?
    render() {
        return (
            <div>
                {this.renderErrors()}

                <p className={styles.descriptionText}>
                    <Message {...messages.forgotPasswordMessage} />
                </p>

                <Input {...this.bindField('email')}
                    icon="envelope"
                    color="lightViolet"
                    autoFocus
                    onFocus={this.fixAutoFocus}
                    required
                    placeholder={messages.accountEmail}
                />

                <p>TODO: тут ещё должна быть капча</p>
                <p>TODO: эту страницу пока что не имплементим</p>
            </div>
        );
    }

    onFormSubmit() {
        // TODO: обработчик отправки письма с инструкцией по смене аккаунта
    }
}

export default function ForgotPassword() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.forgotPasswordTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.lightViolet} type="submit">
                <Message {...messages.sendMail} />
            </button>
        ),
        Links: () => (
            <a href="/send-message">
                <Message {...messages.contactSupport} />
            </a>
        )
    };
}
