import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Panel, PanelBody, PanelFooter } from 'components/ui/Panel';
import { Input } from 'components/ui/Form';

import styles from './signIn.scss';
import messages from './SignIn.messages';

export default class Activation extends Component {
    displayName = 'Activation';

    render() {
        return (
            <div className={styles.signIn}>
                <Helmet title="Activation" />

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
                            {/* TODO: E-mail i18n*/}
                            <Input type="email" color="blue" className={styles.activationCodeInput} placeholder="Enter the code from E-mail here" />
                        </div>
                    </PanelBody>
                    <PanelFooter>
                        <button className={buttons.blue}>
                            <Message {...messages.confirmEmail} />
                        </button>
                    </PanelFooter>
                </Panel>
                <div className={styles.helpLinks}>
                    <a href="#">
                        <Message {...messages.didNotReceivedEmail} />
                    </a>
                </div>
            </div>
        );
    }
}
