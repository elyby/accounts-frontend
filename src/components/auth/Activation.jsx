import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/Form';

import BaseAuthBody from './BaseAuthBody';
import styles from './activation.scss';
import messages from './Activation.messages';

class Body extends BaseAuthBody {
    static propTypes = {
        ...BaseAuthBody.propTypes,
        auth: PropTypes.shape({
            error: PropTypes.string,
            login: PropTypes.shape({
                login: PropTypes.stirng
            })
        })
    };

    render() {
        return (
            <div>
                {this.renderErrors()}

                <div className={styles.description}>
                    <div className={styles.descriptionImage} />

                    <div className={styles.descriptionText}>
                        <Message {...messages.activationMailWasSent} values={{
                            email: (<b>{this.props.user.email}</b>)
                        }} />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <Input {...this.bindField('key')}
                        color="blue"
                        className={styles.activationCodeInput}
                        autoFocus
                        onFocus={this.fixAutoFocus}
                        required
                        placeholder={messages.enterTheCode}
                    />
                </div>
            </div>
        );
    }
}

export default function Activation() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.accountActivationTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.blue}>
                <Message {...messages.confirmEmail} />
            </button>
        ),
        Links: () => (
            <a href="#">
                <Message {...messages.didNotReceivedEmail} />
            </a>
        )
    };
}
