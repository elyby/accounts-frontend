import React from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'components/ui/form';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import styles from './activation.scss';
import messages from './Activation.intl.json';

export default class ActivationBody extends BaseAuthBody {
    static displayName = 'ActivationBody';
    static panelId = 'activation';

    autoFocusField = 'key';

    render() {
        return (
            <div>
                {this.renderErrors()}

                <div className={styles.description}>
                    <div className={styles.descriptionImage} />

                    <div className={styles.descriptionText}>
                        <Message {...messages.activationMailWasSent} values={{
                            email: (<b>{this.context.user.email}</b>)
                        }} />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <Input {...this.bindField('key')}
                        color="blue"
                        className={styles.activationCodeInput}
                        required
                        placeholder={messages.enterTheCode}
                    />
                </div>
            </div>
        );
    }
}
