import React, { Component, PropTypes } from 'react';

import { FormattedMessage as Message } from 'react-intl';

import FormModel from 'models/Form';
import { Form, Button, Input } from 'components/ui/form';

import messages from './PasswordRequestForm.messages';

export default class PasswordRequestForm extends Component {
    static displayName = 'PasswordRequestForm';

    static propTypes = {
        onSubmit: PropTypes.func.isRequired
    };

    form = new FormModel();

    render() {
        return (
            <Form onSubmit={this.onSubmit}>
                <h2>
                    <Message {...messages.title} />
                </h2>

                <Input {...this.form.bindField('password')}
                    type="password"
                    required
                    autoFocus
                    color="green"
                    skin="light"
                    icon="key"
                    placeholder={messages.pleaseEnterPassword}
                />
                <Button color="green" label="OK" block />
            </Form>
        );
    }

    onSubmit = () => {
        this.props.onSubmit(this.form.value('password'));
    };
}
