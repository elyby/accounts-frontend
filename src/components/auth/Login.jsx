import React, { Component } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'redux-simple-router';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Panel, PanelBody, PanelFooter } from 'components/ui/Panel';
import { Input } from 'components/ui/Form';

import messages from './Login.messages';
import {helpLinks as helpLinksStyles} from './helpLinks.scss';
import passwordMessages from './Password.messages';

class Login extends Component {
    displayName = 'Login';

    render() {
        return (
            <div>
                <Message {...messages.signInTitle}>
                    {(msg) => <Helmet title={msg} />}
                </Message>

                <Panel title={<Message {...messages.signInTitle} />}>
                    <PanelBody>
                        <Input icon="envelope" type="email" placeholder={messages.emailOrUsername} />
                    </PanelBody>
                    <PanelFooter>
                        <button className={buttons.green} onClick={this.onSubmit}>
                            <Message {...messages.next} />
                        </button>
                    </PanelFooter>
                </Panel>
                <div className={helpLinksStyles}>
                    <a href="#">
                        <Message {...passwordMessages.forgotPassword} />
                    </a>
                </div>
            </div>
        );
    }

    onSubmit = (event) => {
        event.preventDefault();

        this.props.push('/password');
    };
}


export default connect(null, {
    push: routeActions.push
})(Login);
