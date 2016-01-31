import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Panel, PanelBody, PanelFooter } from 'components/ui/Panel';
import { Input } from 'components/ui/Form';

import styles from './activation.scss';
import {helpLinks as helpLinksStyles} from './helpLinks.scss';
import messages from './Activation.messages';

export default function Activation() {
    var Title = () => ( // TODO: separate component for PageTitle
        <Message {...messages.accountActivationTitle}>
            {(msg) => <span>{msg}<Helmet title={msg} /></span>}
        </Message>
    );
    Title.goBack = '/register';

    return {
        Title,
        Body: () => (
            <div>
                <div className={styles.description}>
                    <div className={styles.descriptionImage} />

                    <div className={styles.descriptionText}>
                        <Message {...messages.activationMailWasSent} values={{
                            email: (<b>erickskrauch@yandex.ru</b>)
                        }} />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <Input color="blue" className={styles.activationCodeInput} placeholder={messages.enterTheCode} />
                </div>
            </div>
        ),
        Footer: (props) => (
            <button className={buttons.blue} onClick={(event) => {
                event.preventDefault();

                props.history.push('/oauth/permissions');
            }}>
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


export class _Activation extends Component {
    displayName = 'Activation';

    render() {
        return (
            <div>
                <Message {...messages.accountActivationTitle}>
                    {(msg) => <Helmet title={msg} />}
                </Message>

                <Panel icon="arrowLeft" title={<Message {...messages.accountActivationTitle} />}>
                    <PanelBody>
                        <div className={styles.description}>
                            <div className={styles.descriptionImage} />

                            <div className={styles.descriptionText}>
                                <Message {...messages.activationMailWasSent} values={{
                                    email: (<b>erickskrauch@yandex.ru</b>)
                                }} />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <Input color="blue" className={styles.activationCodeInput} placeholder={messages.enterTheCode} />
                        </div>
                    </PanelBody>
                    <PanelFooter>
                        <button className={buttons.blue}>
                            <Message {...messages.confirmEmail} />
                        </button>
                    </PanelFooter>
                </Panel>
                <div className={helpLinksStyles}>
                    <a href="#">
                        <Message {...messages.didNotReceivedEmail} />
                    </a>
                </div>
            </div>
        );
    }
}
