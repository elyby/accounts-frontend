import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import { Input } from 'components/ui/form';

import BaseAuthBody from 'components/auth/BaseAuthBody';
import styles from './activation.scss';
import messages from './Activation.intl.json';

export default class ActivationBody extends BaseAuthBody {
    static displayName = 'ActivationBody';
    static panelId = 'activation';

    static propTypes = {
        params: PropTypes.shape({
            key: PropTypes.string
        })
    };

    autoFocusField = this.props.params && this.props.params.key ? null : 'key';

    render() {
        const {key} = this.props.params;

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
