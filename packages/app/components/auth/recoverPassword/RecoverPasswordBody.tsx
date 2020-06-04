import React from 'react';

import { defineMessages, FormattedMessage as Message } from 'react-intl';

import { Input } from 'app/components/ui/form';
import BaseAuthBody from 'app/components/auth/BaseAuthBody';

import styles from './recoverPassword.scss';

// TODO: activation code field may be decoupled into common component and reused here and in activation panel

const placeholders = defineMessages({
    newPassword: 'Enter new password',
    newRePassword: 'Repeat new password',
    enterTheCode: 'Enter confirmation code',
});

export default class RecoverPasswordBody extends BaseAuthBody {
    static displayName = 'RecoverPasswordBody';
    static panelId = 'recoverPassword';
    static hasGoBack = true;

    autoFocusField = this.props.match.params && this.props.match.params.key ? 'newPassword' : 'key';

    render() {
        const { user } = this.context;
        const { key } = this.props.match.params;

        return (
            <div>
                {this.renderErrors()}

                <p className={styles.descriptionText}>
                    {user.maskedEmail ? (
                        <Message
                            key="messageWasSentTo"
                            defaultMessage="The recovery code was sent to your E‑mail {email}."
                            values={{
                                email: <b>{user.maskedEmail}</b>,
                            }}
                        />
                    ) : (
                        <Message
                            key="messageWasSent"
                            defaultMessage="The recovery code was sent to your account E‑mail."
                        />
                    )}{' '}
                    <Message
                        key="enterCodeBelow"
                        defaultMessage="Please enter the code received into the field below:"
                    />
                </p>

                <Input
                    {...this.bindField('key')}
                    color="lightViolet"
                    center
                    required
                    value={key}
                    readOnly={!!key}
                    autoComplete="off"
                    placeholder={placeholders.enterTheCode}
                />

                <p className={styles.descriptionText}>
                    <Message key="enterNewPasswordBelow" defaultMessage="Enter and repeat new password below:" />
                </p>

                <Input
                    {...this.bindField('newPassword')}
                    icon="key"
                    color="lightViolet"
                    type="password"
                    required
                    placeholder={placeholders.newPassword}
                />

                <Input
                    {...this.bindField('newRePassword')}
                    icon="key"
                    color="lightViolet"
                    type="password"
                    required
                    placeholder={placeholders.newRePassword}
                />
            </div>
        );
    }
}
