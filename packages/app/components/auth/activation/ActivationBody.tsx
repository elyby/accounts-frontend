import React from 'react';

import { defineMessages, FormattedMessage as Message } from 'react-intl';

import { Input } from 'app/components/ui/form';

import BaseAuthBody from 'app/components/auth/BaseAuthBody';
import styles from './activation.scss';

const messages = defineMessages({
    enterTheCode: 'Enter the code from E‑mail here',
});

export default class ActivationBody extends BaseAuthBody {
    static displayName = 'ActivationBody';
    static panelId = 'activation';

    autoFocusField = this.props.match.params && this.props.match.params.key ? null : 'key';

    render() {
        const { key } = this.props.match.params;
        const { email } = this.context.user;

        return (
            <div>
                {this.renderErrors()}

                <div className={styles.description}>
                    <div className={styles.descriptionImage} />

                    <div className={styles.descriptionText}>
                        {email ? (
                            <Message
                                key="activationMailWasSent"
                                defaultMessage="Please check {email} for the message with further instructions"
                                values={{
                                    email: <b>{email}</b>,
                                }}
                            />
                        ) : (
                            <Message
                                key="activationMailWasSentNoEmail"
                                defaultMessage="Please check your E‑mail for the message with further instructions"
                            />
                        )}
                    </div>
                </div>
                <div className={styles.formRow}>
                    <Input
                        {...this.bindField('key')}
                        color="blue"
                        center
                        required
                        value={key}
                        readOnly={!!key}
                        autoComplete="off"
                        placeholder={messages.enterTheCode}
                    />
                </div>
            </div>
        );
    }
}
