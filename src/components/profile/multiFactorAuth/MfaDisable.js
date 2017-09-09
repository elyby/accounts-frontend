// @flow
import React, { Component } from 'react';

import logger from 'services/logger';
import mfa from 'services/api/mfa';

import MfaDisableForm from './disableForm/MfaDisableForm';
import MfaStatus from './status/MfaStatus';

import type { FormModel } from 'components/ui/form';

export default class MfaDisable extends Component<{
    onSubmit: (form: FormModel, sendData: () => Promise<*>) => Promise<*>,
    onComplete: Function
}, {
    showForm?: bool
}> {
    state = {};

    render() {
        const { showForm } = this.state;

        return showForm ? (
            <MfaDisableForm onSubmit={this.onSubmit}/>
        ) : (
            <MfaStatus onProceed={this.onProceed} />
        );
    }

    onProceed = () => this.setState({showForm: true});

    onSubmit = (form: FormModel) => {
        return this.props.onSubmit(
            form,
            () => {
                const data = form.serialize();

                return mfa.disable(data);
            }
        )
            .then(() => this.props.onComplete())
            .catch((resp) => {
                const {errors} = resp || {};

                if (errors) {
                    return Promise.reject(errors);
                }

                logger.error('MFA: Unexpected disable form result', {
                    resp
                });
            });
    };
}
