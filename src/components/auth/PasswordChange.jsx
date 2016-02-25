import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/Form';

import BaseAuthBody from './BaseAuthBody';
import passwordChangedMessages from './PasswordChange.messages';

import icons from 'components/ui/icons.scss';
import styles from './passwordChange.scss';

class Body extends BaseAuthBody {
    static propTypes = {
        ...BaseAuthBody.propTypes/*,
        // Я так полагаю, это правила валидации?
        login: PropTypes.func.isRequired,
        auth: PropTypes.shape({
            error: PropTypes.string,
            login: PropTypes.shape({
                login: PropTypes.stirng
            })
        })*/
    };

    render() {
        return (
            <div>
                {this.renderErrors()}

                <div className={styles.security}>
                    <span className={icons.lock} />
                </div>

                <p className={styles.descriptionText}>
                    <Message {...passwordChangedMessages.changePasswordMessage} />
                </p>

                <Input {...this.bindField('newPassword')}
                    icon="key"
                    color="darkBlue"
                    autoFocus
                    required
                    placeholder={passwordChangedMessages.newPassword}
                />

                <Input {...this.bindField('newRePassword')}
                    icon="key"
                    color="darkBlue"
                    required
                    placeholder={passwordChangedMessages.newRePassword}
                />
            </div>
        );
    }

    onFormSubmit() {
        this.props.login(this.serialize());
    }
}

export default function PasswordChange() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...passwordChangedMessages.changePasswordTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.darkBlue} type="submit">
                <Message {...passwordChangedMessages.change} />
            </button>
        ),
        Links: () => (
            <a href="/oauth/permissions">
                <Message {...passwordChangedMessages.skipThisStep} />
            </a>
        )
    };
}
