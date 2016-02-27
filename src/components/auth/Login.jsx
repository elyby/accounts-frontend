import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';
import { Link } from 'react-router';

import buttons from 'components/ui/buttons.scss';
import { Input } from 'components/ui/Form';

import BaseAuthBody from './BaseAuthBody';
import messages from './Login.messages';
import passwordMessages from './Password.messages';

class Body extends BaseAuthBody {
    static propTypes = {
        ...BaseAuthBody.propTypes,
        login: PropTypes.func.isRequired,
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

                <Input {...this.bindField('login')}
                    icon="envelope"
                    autoFocus
                    required
                    placeholder={messages.emailOrUsername}
                />
            </div>
        );
    }

    onFormSubmit() {
        this.props.login(this.serialize());
    }
}

export default function Login() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.loginTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.green} type="submit">
                <Message {...messages.next} />
            </button>
        ),
        Links: () => (
            <Link to="/forgot-password">
                <Message {...passwordMessages.forgotPassword} />
            </Link>
        )
    };
}
