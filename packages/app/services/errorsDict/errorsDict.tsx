import React, { ComponentType, ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';

import { RelativeTime } from 'app/components/ui';

import messages from './errorsDict.intl.json';

const SuggestResetPassword: ComponentType = () => (
    <>
        <br />
        <Message
            {...messages.suggestResetPassword}
            values={{
                forgotYourPassword: (
                    <Link to="/forgot-password">
                        <Message {...messages.forgotYourPassword} />
                    </Link>
                ),
            }}
        />
    </>
);

const ResendKey: ComponentType<{ url: string }> = ({ url }) => (
    <>
        {' '}
        <Link to={url}>
            <Message {...messages.doYouWantRequestKey} />
        </Link>
    </>
);

const errorsMap: Record<string, (props?: Record<string, any>) => ReactElement> = {
    'error.login_required': () => <Message {...messages.loginRequired} />,
    'error.login_not_exist': () => <Message {...messages.loginNotExist} />,
    'error.password_required': () => <Message {...messages.passwordRequired} />,

    'error.password_incorrect': (props) => (
        // props are handled in validationErrorsHandler in components/auth/actions
        <>
            <Message {...messages.invalidPassword} />
            {props && props.isGuest ? <SuggestResetPassword /> : null}
        </>
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
    'error.email_not_available': (props) => (
        // props are handled in validationErrorsHandler in components/auth/actions
        <>
            <Message {...messages.emailNotAvailable} />
            {props && props.isGuest ? <SuggestResetPassword /> : null}
        </>
    ),

    'error.totp_required': () => <Message {...messages.totpRequired} />,
    'error.totp_incorrect': () => <Message {...messages.totpIncorrect} />,
    'error.otp_already_enabled': () => <Message {...messages.mfaAlreadyEnabled} />,

    'error.rePassword_required': () => <Message {...messages.rePasswordRequired} />,
    'error.password_too_short': () => <Message {...messages.passwordTooShort} />,
    'error.rePassword_does_not_match': () => <Message {...messages.passwordsDoesNotMatch} />,
    'error.rulesAgreement_required': () => <Message {...messages.rulesAgreementRequired} />,
    'error.key_required': () => <Message {...messages.keyRequired} />,
    'error.key_not_exists': (props) => (
        <>
            <Message {...messages.keyNotExists} />
            {props && props.repeatUrl ? <ResendKey url={props.repeatUrl} /> : null}
        </>
    ),
    'error.key_expire': (props) => errorsMap['error.key_not_exists'](props),

    'error.newPassword_required': () => <Message {...messages.newPasswordRequired} />,
    'error.newRePassword_required': () => <Message {...messages.newRePasswordRequired} />,

    'error.account_not_activated': () => <Message {...messages.accountNotActivated} />,
    'error.account_banned': () => <Message {...messages.accountBanned} />,

    'error.recently_sent_message': (props) => (
        <Message
            {...messages.emailFrequency}
            values={{
                // for msLeft @see AuthError.jsx
                time: <RelativeTime timestamp={props!.msLeft} />,
            }}
        />
    ),

    'error.email_not_found': () => <Message {...messages.emailNotFound} />,
    'error.account_already_activated': () => <Message {...messages.accountAlreadyActivated} />,

    'error.captcha_required': () => <Message {...messages.captchaRequired} />,
    'error.captcha_invalid': (props) => errorsMap['error.captcha_required'](props),

    'error.redirectUri_required': () => <Message {...messages.redirectUriRequired} />,
    'error.redirectUri_invalid': () => <Message {...messages.redirectUriInvalid} />,
};

interface ErrorLiteral {
    type: string;
    payload?: Record<string, any>;
}

type Error = string | ErrorLiteral;

export function resolve(error: Error): ReactNode {
    let payload = {};

    if (typeof error !== 'string') {
        payload = error.payload || {};
        error = error.type;
    }

    return errorsMap[error] ? errorsMap[error](payload) : error;
}
