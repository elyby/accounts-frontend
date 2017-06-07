import React from 'react';

import { FormattedMessage as Message, FormattedRelative as Relative } from 'react-intl';
import { Link } from 'react-router-dom';

import messages from './errorsDict.intl.json';

/* eslint-disable react/prop-types, react/display-name, react/no-multi-comp, no-use-before-define */

export default {
    resolve(error) {
        let payload = {};

        if (error.type) {
            payload = error.payload || {};
            error = error.type;
        }
        return errorsMap[error] ? errorsMap[error](payload) : error;
    }
};

const errorsMap = {
    'error.login_required': () => <Message {...messages.loginRequired} />,
    'error.login_not_exist': () => <Message {...messages.loginNotExist} />,
    'error.password_required': () => <Message {...messages.passwordRequired} />,

    'error.password_incorrect': (props = {}) => (
        // props are handled in validationErrorsHandler in components/auth/actions
        <span>
            <Message {...messages.invalidPassword} />
            {props.isGuest ? errorsMap.suggestResetPassword() : null}
        </span>
    ),

    'error.username_required': () => <Message {...messages.usernameRequired} />,
    'error.username_invalid': () => <Message {...messages.usernameInvalid} />,
    'error.username_too_short': () => <Message {...messages.usernameTooShort} />,
    'error.username_too_long': () => <Message {...messages.usernameTooLong} />,
    'error.username_not_available': () => <Message {...messages.usernameUnavailable} />,

    'error.email_required': () => <Message {...messages.emailRequired} />,
    'error.email_too_long': () => <Message {...messages.emailToLong} />,
    'error.email_invalid': () => <Message {...messages.emailInvalid} />,
    'error.email_is_tempmail': () => <Message {...messages.emailIsTempmail} />,
    'error.email_not_available': (props = {}) => (
        // props are handled in validationErrorsHandler in components/auth/actions
        <span>
            <Message {...messages.emailNotAvailable} />
            {props.isGuest ? errorsMap.suggestResetPassword() : null}
        </span>
    ),

    'error.rePassword_required': () => <Message {...messages.rePasswordRequired} />,
    'error.password_too_short': () => <Message {...messages.passwordTooShort} />,
    'error.rePassword_does_not_match': () => <Message {...messages.passwordsDoesNotMatch} />,
    'error.rulesAgreement_required': () => <Message {...messages.rulesAgreementRequired} />,
    'error.key_required': () => <Message {...messages.keyRequired} />,
    'error.key_not_exists': (props) => (
        <span>
            <Message {...messages.keyNotExists} />
            {props.repeatUrl ? errorsMap.resendKey(props.repeatUrl) : null}
        </span>
    ),
    'error.key_expire': (props) => errorsMap['error.key_not_exists'](props),

    'error.newPassword_required': () => <Message {...messages.newPasswordRequired} />,
    'error.newRePassword_required': () => <Message {...messages.newRePasswordRequired} />,

    'error.account_not_activated': () => <Message {...messages.accountNotActivated} />,
    'error.account_banned': () => <Message {...messages.accountBanned} />,

    'error.recently_sent_message': (props) => (
        <Message {...messages.emailFrequency} values={{
            // for msLeft @see AuthError.jsx
            time: <Relative value={props.msLeft} updateInterval={1000} />
        }} />
    ),

    'error.email_not_found': () => <Message {...messages.emailNotFound} />,
    'error.account_already_activated': () => <Message {...messages.accountAlreadyActivated} />,

    'error.captcha_required': () => <Message {...messages.captchaRequired} />,
    'error.captcha_invalid': () => errorsMap['error.captcha_required'](),

    suggestResetPassword: () => (
        <span>
            <br/>
            <Message {...messages.suggestResetPassword} values={{
                link: (
                    <Link to="/forgot-password">
                        <Message {...messages.forgotYourPassword} />
                    </Link>
                )
            }} />
        </span>
    ),

    resendKey: (url) => (
        <span>
            {' '}
            <Link to={url}>
                <Message {...messages.doYouWantRequestKey} />
            </Link>
        </span>
    )
};
