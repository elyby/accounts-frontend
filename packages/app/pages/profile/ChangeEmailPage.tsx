import React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';

import { connect } from 'app/functions';
import FormModel from 'app/components/ui/form/FormModel';
import ChangeEmail, { ChangeEmailStep } from 'app/components/profile/changeEmail/ChangeEmail';
import { requestEmailChange, setNewEmail, confirmNewEmail } from 'app/services/api/accounts';
import Context from 'app/components/profile/Context';

interface RouteParams {
    step: 'step1' | 'step2' | 'step3';
    code: string;
}

interface Props extends RouteComponentProps<RouteParams> {
    email: string;
}

class ChangeEmailPage extends React.Component<Props> {
    static contextType = Context;
    declare context: React.ContextType<typeof Context>;

    render() {
        const { step = 'step1', code } = this.props.match.params;

        if (step && !/^step[123]$/.test(step)) {
            // wrong param value
            return <Redirect to="/404" />;
        }

        return (
            <ChangeEmail
                onSubmit={this.onSubmit}
                email={this.props.email}
                step={(Number(step.slice(-1)) - 1) as ChangeEmailStep}
                onChangeStep={this.onChangeStep}
                code={code}
            />
        );
    }

    onChangeStep = (step: number) => {
        this.props.history.push(`/profile/change-email/step${++step}`);
    };

    onSubmit = (step: number, form: FormModel): Promise<void> => {
        return this.context
            .onSubmit({
                form,
                repeatUrl: step > 0 ? '/profile/change-email' : undefined,
                sendData: () => {
                    const { userId } = this.context;
                    const data = form.serialize();

                    switch (step) {
                        case 0:
                            return requestEmailChange(userId, data.password);
                        case 1:
                            return setNewEmail(userId, data.email, data.key);
                        case 2:
                            return confirmNewEmail(userId, data.key);
                        default:
                            throw new Error(`Unsupported step ${step}`);
                    }
                },
            })
            .then(() => {
                step > 1 && this.context.goToProfile();
            });
    };
}

export default connect((state) => ({
    email: state.user.email,
}))(ChangeEmailPage);
