import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/Form';

import BaseAuthBody from './BaseAuthBody';
import messages from './ForgotPassword.messages';

import styles from './forgotPassword.scss';

class Body extends BaseAuthBody {
    static propTypes = {
        ...BaseAuthBody.propTypes,
        //login: PropTypes.func.isRequired,
        auth: PropTypes.shape({
            error: PropTypes.string,
            login: PropTypes.shape({
                email: PropTypes.stirng
            })
        })
    };

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
        //this.props.login(this.serialize());
    }
}

export default function ForgotPassword() {
    var Title = () => ( // TODO: separate component for PageTitle
        <Message {...messages.forgotPasswordTitle}>
            {(msg) => <span>{msg}<Helmet title={msg} /></span>}
        </Message>
    );
    Title.goBack = true;

    return {
        Title,
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
