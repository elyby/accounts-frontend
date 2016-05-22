import React, { Component, PropTypes } from 'react';

import ChangeEmail from 'components/profile/changeEmail/ChangeEmail';

import accounts from 'services/api/accounts';

class ChangeEmailPage extends Component {
    static displayName = 'ChangeEmailPage';

    static propTypes = {
        email: PropTypes.string.isRequired,
        params: PropTypes.shape({
            step: PropTypes.oneOf(['step1', 'step2', 'step3']),
            code: PropTypes.string
        })
    };

    static contextTypes = {
        router: PropTypes.shape({
            push: PropTypes.func
        }).isRequired,
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired
    };

    componentWillMount() {
        const step = this.props.params.step;

        if (step && !/^step\d$/.test(step)) {
            // wrong param value
            // TODO: probably we should decide with something better here
            this.context.router.push('/');
        }
    }

    render() {
        const {params: {step = 'step1', code}} = this.props;

        return (
            <ChangeEmail
                onSubmit={this.onSubmit}
                email={this.props.email}
                step={step.slice(-1) * 1 - 1}
                onChangeStep={this.onChangeStep}
                code={code}
            />
        );
    }

    onChangeStep = (step) => {
        this.context.router.push(`/profile/change-email/step${++step}`);
    };

    onSubmit = (step, form) => {
        return this.context.onSubmit({
            form,
            sendData: () => {
                const data = form.serialize();

                switch (step) {
                    case 0:
                        return accounts.requestEmailChange();
                    case 1:
                        return accounts.setNewEmail(data);
                    case 2:
                        return accounts.confirmNewEmail(data);
                    default:
                        throw new Error(`Unsupported step ${step}`);
                }
            }
        }).then(() => {
            step > 1 && this.context.goToProfile();
        });
    };
}

import { connect } from 'react-redux';

export default connect((state) => ({
    email: state.user.email
}), {
})(ChangeEmailPage);
