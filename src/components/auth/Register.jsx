import React, { Component } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Panel, PanelBody, PanelFooter } from 'components/ui/Panel';
import { Input, Checkbox } from 'components/ui/Form';

import {helpLinks as helpLinksStyles} from './helpLinks.scss';
import messages from './Register.messages';
import activationMessages from './Activation.messages';

export default function Register() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.registerTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body: () => (
            <div>
                <Input icon="user" color="blue" type="text" placeholder={messages.yourNickname} />
                <Input icon="envelope" color="blue" type="email" placeholder={messages.yourEmail} />
                <Input icon="key" color="blue" type="password" placeholder={messages.accountPassword} />
                <Input icon="key" color="blue" type="password" placeholder={messages.repeatPassword} />

                <Checkbox color="blue" label={
                    <Message {...messages.acceptRules} values={{
                        link: (
                            <a href="#">
                                <Message {...messages.termsOfService} />
                            </a>
                        )
                    }} />
                } />
            </div>
        ),
        Footer: (props) => (
            <button className={buttons.blue} onClick={(event) => {
                event.preventDefault();

                props.history.push('/activation');
            }}>
                <Message {...messages.signUpButton} />
            </button>
        ),
        Links: () => (
            <a href="#">
                <Message {...activationMessages.didNotReceivedEmail} />
            </a>
        )
    };
}

export class _Register extends Component {
    displayName = 'Register';

    render() {
        return (
            <div>
                <Message {...messages.registerTitle}>
                    {(msg) => <Helmet title={msg} />}
                </Message>

                <Panel title={<Message {...messages.registerTitle} />}>
                    <PanelBody>
                        <Input icon="user" color="blue" type="text" placeholder={messages.yourNickname} />
                        <Input icon="envelope" color="blue" type="email" placeholder={messages.yourEmail} />
                        <Input icon="key" color="blue" type="password" placeholder={messages.accountPassword} />
                        <Input icon="key" color="blue" type="password" placeholder={messages.repeatPassword} />

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
                <div className={helpLinksStyles}>
                    <a href="#">
                        <Message {...activationMessages.didNotReceivedEmail} />
                    </a>
                </div>
            </div>
        );
    }
}
