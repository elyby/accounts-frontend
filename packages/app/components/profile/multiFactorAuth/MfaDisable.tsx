import React from 'react';
import logger from 'app/services/logger';
import { disable as disableMFA } from 'app/services/api/mfa';
import { FormModel } from 'app/components/ui/form';

import Context from '../Context';
import MfaDisableForm from './disableForm/MfaDisableForm';
import MfaStatus from './status/MfaStatus';

export default class MfaDisable extends React.Component<
    {
        onSubmit: (form: FormModel, sendData: () => Promise<void>) => Promise<void>;
        onComplete: () => void;
    },
    {
        showForm: boolean;
    }
> {
    static contextType = Context;
    /* TODO: use declare */ context: React.ContextType<typeof Context>;

    state = {
        showForm: false,
    };

    render() {
        const { showForm } = this.state;

        return showForm ? <MfaDisableForm onSubmit={this.onSubmit} /> : <MfaStatus onProceed={this.onProceed} />;
    }

    onProceed = () => this.setState({ showForm: true });

    onSubmit = (form: FormModel) => {
        return this.props
            .onSubmit(form, () => {
                const { totp, password } = form.serialize() as {
                    totp: string;
                    password?: string;
                };

                return disableMFA(this.context.userId, totp, password);
            })
            .then(() => this.props.onComplete())
            .catch((resp) => {
                const { errors } = resp || {};

                if (errors) {
                    return Promise.reject(errors);
                }

                logger.error('MFA: Unexpected disable form result', {
                    resp,
                });
            });
    };
}
