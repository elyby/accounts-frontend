import React, { ComponentType, ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage as Message } from 'react-intl';

import { RelativeTime } from 'app/components/ui';

const SuggestResetPassword: ComponentType = () => (
    <>
        <br />
        <Message
            key="suggestResetPassword"
            defaultMessage="Have you {forgotYourPassword}?"
            values={{
                forgotYourPassword: (
                    <Link to="/forgot-password">
                        <Message key="forgotYourPassword" defaultMessage="forgot your password" />
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
            <Message key="doYouWantRequestKey" defaultMessage="Do you want to request a new key?" />
        </Link>
    </>
);

const errorsMap: Record<string, (props?: Record<string, any>) => ReactElement> = {
    'error.login_required': () => <Message key="loginRequired" defaultMessage="Please enter E‑mail or username" />,
    'error.login_not_exist': () => (
        <Message key="loginNotExist" defaultMessage="Sorry, Ely doesn't recognise your login." />
    ),
    'error.password_required': () => <Message key="passwordRequired" defaultMessage="Please enter password" />,

    'error.password_incorrect': (props) => (
        // props are handled in validationErrorsHandler in components/auth/actions
        <>
            <Message key="invalidPassword" defaultMessage="You have entered wrong account password." />
            {props && props.isGuest ? <SuggestResetPassword /> : null}
        </>
    ),

    'error.username_required': () => <Message key="usernameRequired" defaultMessage="Username is required" />,
    'error.username_invalid': () => <Message key="usernameInvalid" defaultMessage="Username is invalid" />,
    'error.username_too_short': () => <Message key="usernameTooShort" defaultMessage="Username is too short" />,
    'error.username_too_long': () => <Message key="usernameTooLong" defaultMessage="Username is too long" />,
    'error.username_not_available': () => (
        <Message key="usernameUnavailable" defaultMessage="This username is already taken" />
    ),

    'error.email_required': () => <Message key="emailRequired" defaultMessage="E‑mail is required" />,
    'error.email_too_long': () => <Message key="emailToLong" defaultMessage="E‑mail is too long" />,
    'error.email_invalid': () => <Message key="emailInvalid" defaultMessage="E‑mail is invalid" />,
    'error.email_is_tempmail': () => (
        <Message key="emailIsTempmail" defaultMessage="Tempmail E‑mail addresses is not allowed" />
    ),
    'error.email_not_available': (props) => (
        // props are handled in validationErrorsHandler in components/auth/actions
        <>
            <Message key="emailNotAvailable" defaultMessage="This E‑mail is already registered." />
            {props && props.isGuest ? <SuggestResetPassword /> : null}
        </>
    ),

    'error.totp_required': () => <Message key="totpRequired" defaultMessage="Please, enter the code" />,
    'error.totp_incorrect': () => <Message key="totpIncorrect" defaultMessage="The code is incorrect" />,
    'error.otp_already_enabled': () => (
        <Message key="mfaAlreadyEnabled" defaultMessage="The two factor auth is already enabled" />
    ),

    'error.rePassword_required': () => (
        <Message key="rePasswordRequired" defaultMessage="Please retype your password" />
    ),
    'error.password_too_short': () => (
        <Message key="passwordTooShort" defaultMessage="Your password should be at least 8 characters length" />
    ),
    'error.rePassword_does_not_match': () => (
        <Message key="passwordsDoesNotMatch" defaultMessage="The passwords does not match" />
    ),
    'error.rulesAgreement_required': () => (
        <Message key="rulesAgreementRequired" defaultMessage="You must accept rules in order to create an account" />
    ),
    'error.key_required': () => <Message key="keyRequired" defaultMessage="Please, enter an activation key" />,
    'error.key_not_exists': (props) => (
        <>
            <Message key="keyNotExists" defaultMessage="The key is incorrect or has expired." />
            {props && props.repeatUrl ? <ResendKey url={props.repeatUrl} /> : null}
        </>
    ),
    'error.key_expire': (props) => errorsMap['error.key_not_exists'](props),

    'error.newPassword_required': () => (
        <Message key="newPasswordRequired" defaultMessage="Please enter new password" />
    ),
    'error.newRePassword_required': () => (
        <Message key="newRePasswordRequired" defaultMessage="Please repeat new password" />
    ),

    'error.account_not_activated': () => (
        <Message key="accountNotActivated" defaultMessage="The account is not activated" />
    ),
    'error.account_banned': () => <Message key="accountBanned" defaultMessage="Account is blocked" />,

    'error.recently_sent_message': (props) => (
        <Message
            key="emailFrequency"
            defaultMessage="Please cool down, you are requesting E‑mails too often. New key can be retrieved {time}."
            values={{
                // for msLeft @see AuthError.jsx
                time: <RelativeTime timestamp={props!.msLeft} />,
            }}
        />
    ),

    'error.email_not_found': () => <Message key="emailNotFound" defaultMessage="Specified E‑mail is not found" />,
    'error.account_already_activated': () => (
        <Message key="accountAlreadyActivated" defaultMessage="This account is already activated" />
    ),

    'error.captcha_required': () => <Message key="captchaRequired" defaultMessage="Please, solve the captcha" />,
    'error.captcha_invalid': (props) => errorsMap['error.captcha_required'](props),

    'error.redirectUri_required': () => <Message key="redirectUriRequired" defaultMessage="Redirect URI is required" />,
    'error.redirectUri_invalid': () => <Message key="redirectUriInvalid" defaultMessage="Redirect URI is invalid" />,

    invalid_user_code: () => <Message key="invalidUserCode" defaultMessage="Invalid Device Code" />,
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
