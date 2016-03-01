import React, { PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';
import Helmet from 'react-helmet';

import buttons from 'components/ui/buttons.scss';
import { Input, Checkbox } from 'components/ui/Form';

import BaseAuthBody from './BaseAuthBody';
import messages from './Register.messages';
import activationMessages from './Activation.messages';

// TODO: password and username can be validate for length and sameness

class Body extends BaseAuthBody {
    static propTypes = {
        ...BaseAuthBody.propTypes,
        register: PropTypes.func.isRequired,
        auth: PropTypes.shape({
            error: PropTypes.string,
            register: PropTypes.shape({
                email: PropTypes.string,
                username: PropTypes.stirng,
                password: PropTypes.stirng,
                rePassword: PropTypes.stirng,
                rulesAgreement: PropTypes.boolean
            })
        })
    };

    render() {
        return (
            <div>
                {this.renderErrors()}

                <Input {...this.bindField('username')}
                    icon="user"
                    color="blue"
                    type="text"
                    autoFocus
                    required
                    placeholder={messages.yourNickname}
                />

                <Input {...this.bindField('email')}
                    icon="envelope"
                    color="blue"
                    type="email"
                    required
                    placeholder={messages.yourEmail}
                />

                <Input {...this.bindField('password')}
                    icon="key"
                    color="blue"
                    type="password"
                    required
                    placeholder={messages.accountPassword}
                />

                <Input {...this.bindField('rePassword')}
                    icon="key"
                    color="blue"
                    type="password"
                    required
                    placeholder={messages.repeatPassword}
                />

                <Checkbox {...this.bindField('rulesAgreement')}
                    color="blue"
                    required
                    label={
                        <Message {...messages.acceptRules} values={{
                            link: (
                                <a href="#">
                                    <Message {...messages.termsOfService} />
                                </a>
                            )
                        }} />
                    }
                />
            </div>
        );
    }
}

export default function Register() {
    return {
        Title: () => ( // TODO: separate component for PageTitle
            <Message {...messages.registerTitle}>
                {(msg) => <span>{msg}<Helmet title={msg} /></span>}
            </Message>
        ),
        Body,
        Footer: () => (
            <button className={buttons.blue} type="submit">
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
