// @flow
import type { RouterHistory, Match } from 'react-router';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MultiFactorAuth from 'components/profile/multiFactorAuth';
import type { MfaStep } from 'components/profile/multiFactorAuth';
import type { FormModel } from 'components/ui/form';
import type { User } from 'components/user';

interface Props {
    user: User;
    history: RouterHistory;
    match: {
        ...Match;
        params: {
            step?: '1' | '2' | '3';
        };
    };
}

class MultiFactorAuthPage extends Component<Props> {
    static contextTypes = {
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired
    };

    componentWillMount() {
        const step = this.props.match.params.step;
        const { user } = this.props;

        if (step) {
            if (!/^[1-3]$/.test(step)) {
                // wrong param value
                this.props.history.push('/404');
                return;
            }

            if (user.isOtpEnabled) {
                this.props.history.push('/mfa');
            }
        }
    }

    render() {
        const { user } = this.props;

        return (
            <MultiFactorAuth
                isMfaEnabled={user.isOtpEnabled}
                onSubmit={this.onSubmit}
                step={this.getStep()}
                onChangeStep={this.onChangeStep}
                onComplete={this.onComplete}
            />
        );
    }

    getStep(): MfaStep {
        const step = (parseInt(this.props.match.params.step, 10) || 1) - 1;

        if (step !== 0
            && step !== 1
            && step !== 2
        ) { // NOTE: flow does not understand Array.includes()
            return 1;
        }

        return step;
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

export default connect(({user}): { user: User } => ({user}))(MultiFactorAuthPage);
