import React, { Component } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Panel, PanelBody, PanelFooter } from 'components/ui/Panel';
import { Input } from 'components/ui/Form';

import messages from './Login.messages';
import {helpLinks as helpLinksStyles} from './helpLinks.scss';
import passwordMessages from './Password.messages';

export default function Login() {
    var context = {
        onSubmit(event) {
            event.preventDefault();

            this.props.push('/password');
        }
    };

    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.loginTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body: () => <Input icon="envelope" type="email" placeholder={messages.emailOrUsername} />,
        Footer: (props) => (
            <button className={buttons.green} onClick={(event) => {
                event.preventDefault();

                props.history.push('/password');
            }}>
                <Message {...messages.next} />
            </button>
        ),
        Links: () => (
            <a href="#">
                <Message {...passwordMessages.forgotPassword} />
            </a>
        )
    };
}

class _Login extends Component {
    displayName = 'Login';

    render() {
        return (
            <div>
                <Message {...messages.loginTitle}>
                    {(msg) => <Helmet title={msg} />}
                </Message>

                <Panel title={<Message {...messages.loginTitle} />}>
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


// export connect(null, {
//     push: routeActions.push
// })(Login);
