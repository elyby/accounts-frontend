import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import icons from 'components/ui/icons.scss';
import { Panel, PanelBody, PanelFooter, PanelBodyHeader } from 'components/ui/Panel';
import { Input, Checkbox } from 'components/ui/Form';

import styles from './signIn.scss';
import messages from './SignIn.messages';

export default class Register extends Component {
    displayName = 'Register';

    render() {
        return (
            <div className={styles.signIn}>
                <Helmet title="Register" />

                <Panel title={<Message {...messages.signUpTitle} />}>
                    <PanelBody>
                        {/* TODO: E-mail i18n*/}
                        <Input icon="user" color="blue" type="text" placeholder="Your nickname" />
                        {/* TODO: E-mail i18n*/}
                        <Input icon="envelope" color="blue" type="email" placeholder="Your E-mail" />
                        {/* TODO: Account password i18n*/}
                        <Input icon="key" color="blue" type="password" placeholder="Account password" />
                        {/* TODO: Account password i18n*/}
                        <Input icon="key" color="blue" type="password" placeholder="Repeat password" />

                        <Checkbox color="blue" label={
                            <Message {...messages.acceptRules} values={{
                                link: (
                                    <a href="#">
                                        <Message {...messages.termsOfService} />
                                    </a>
                                )
                            }} />
                        } />
                    </PanelBody>
                    <PanelFooter>
                        <button className={buttons.blue}>
                            <Message {...messages.signUpButton} />
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
