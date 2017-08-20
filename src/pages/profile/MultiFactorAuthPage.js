// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MultiFactorAuth, { MfaStep } from 'components/profile/multiFactorAuth';

import type { FormModel } from 'components/ui/form';

class MultiFactorAuthPage extends Component {
    props: {
        history: {
            push: (string) => void
        },
        match: {
            params: {
                step?: '1'|'2'|'3'
            }
        }
    };

    static contextTypes = {
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired
    };

    componentWillMount() {
        const step = this.props.match.params.step;

        if (step && !/^[1-3]$/.test(step)) {
            // wrong param value
            this.props.history.push('/404');
        }
    }

    render() {
        const step = (parseInt(this.props.match.params.step, 10) || 1) - 1;

        return (
            <MultiFactorAuth
                onSubmit={this.onSubmit}
                step={step}
                onChangeStep={this.onChangeStep}
                onComplete={this.onComplete}
            />
        );
    }

    onChangeStep = (step: MfaStep) => {
        this.props.history.push(`/profile/mfa/step${step + 1}`);
    };

    onSubmit = (form: FormModel, sendData: () => Promise<*>) => {
        return this.context.onSubmit({
            form,
            sendData
        });
    };

    onComplete = () => {
        this.context.goToProfile();
    };
}

export default MultiFactorAuthPage;
