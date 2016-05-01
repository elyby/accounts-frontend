import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import { PanelBodyHeader } from 'components/ui/Panel';

import messages from './AuthError.messages';

export default class AuthError extends Component {
    static displayName = 'AuthError';

    static propTypes = {
        error: PropTypes.string.isRequired,
        onClose: PropTypes.func
    };

    render() {
        let { error } = this.props;

        if (this.errorsMap[error]) {
            error = this.errorsMap[error]();
        }

        return (
            <PanelBodyHeader type="error" onClose={this.props.onClose}>
                {error}
            </PanelBodyHeader>
        );
    }

    errorsMap = {
        'error.login_required': () => <Message {...messages.loginRequired} />,
        'error.login_not_exist': () => <Message {...messages.loginNotExist} />,
        'error.password_required': () => <Message {...messages.passwordRequired} />,

        'error.password_incorrect': () => (
            <span>
                <Message {...messages.invalidPassword} />
                <br/>
                <Message {...messages.suggestResetPassword} values={{
                    link: (
                        <a href="#">
                            <Message {...messages.forgotYourPassword} />
                        </a>
                    )
                }} />
            </span>
        ),

        'error.username_required': () => <Message {...messages.usernameRequired} />,
        'error.email_required': () => <Message {...messages.emailRequired} />,
        'error.email_invalid': () => <Message {...messages.emailInvalid} />,
        'error.email_is_tempmail': () => <Message {...messages.emailIsTempmail} />,

        'error.email_not_available': () => (
            <span>
                <Message {...messages.emailNotAvailable} />
                <br/>
                <Message {...messages.suggestResetPassword} values={{
                    link: (
                        <a href="#">
                            <Message {...messages.forgotYourPassword} />
                        </a>
                    )
                }} />
            </span>
        ),

        'error.rePassword_required': () => <Message {...messages.rePasswordRequired} />,
        'error.password_too_short': () => <Message {...messages.passwordTooShort} />,
        'error.rePassword_does_not_match': () => <Message {...messages.passwordsDoesNotMatch} />,
        'error.rulesAgreement_required': () => <Message {...messages.rulesAgreementRequired} />,
        'error.you_must_accept_rules': () => this.errorsMap['error.rulesAgreement_required'](),
        'error.key_required': () => <Message {...messages.keyRequired} />,
        'error.key_is_required': () => this.errorsMap['error.key_required'](),
        'error.key_not_exists': () => <Message {...messages.keyNotExists} />,

        'error.newPassword_required': () => <Message {...messages.newPasswordRequired} />,
        'error.newRePassword_required': () => <Message {...messages.newRePasswordRequired} />,
        'error.newRePassword_does_not_match': () => <Message {...messages.passwordsDoesNotMatch} />
    };
}
