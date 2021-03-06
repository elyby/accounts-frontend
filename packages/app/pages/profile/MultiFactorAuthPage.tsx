import React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';

import { connect } from 'app/functions';
import MultiFactorAuth, { MfaStep } from 'app/components/profile/multiFactorAuth';
import { FormModel } from 'app/components/ui/form';
import { User } from 'app/components/user';
import Context from 'app/components/profile/Context';

interface Props
    extends RouteComponentProps<{
        step?: '1' | '2' | '3';
    }> {
    user: User;
}

class MultiFactorAuthPage extends React.Component<Props> {
    static contextType = Context;
    declare context: React.ContextType<typeof Context>;

    render() {
        const {
            user,
            match: {
                params: { step },
            },
        } = this.props;

        if (step) {
            if (!/^[1-3]$/.test(step)) {
                // wrong param value
                return <Redirect to="/404" />;
            }

            if (user.isOtpEnabled) {
                return <Redirect to="/mfa" />;
            }
        }

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
        const step = Number(this.props.match.params.step) - 1;

        if (step !== 0 && step !== 1 && step !== 2) {
            return 0;
        }

        return step;
    }

    onChangeStep = (step: number) => {
        this.props.history.push(`/profile/mfa/step${step + 1}`);
    };

    onSubmit = (form: FormModel, sendData: () => Promise<void>) => {
        return this.context.onSubmit({
            form,
            sendData,
        });
    };

    onComplete = () => {
        this.context.goToProfile();
    };
}

export default connect(({ user }) => ({ user }))(MultiFactorAuthPage);
