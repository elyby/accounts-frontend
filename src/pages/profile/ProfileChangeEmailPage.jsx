import React, { Component, PropTypes } from 'react';

import { FormModel } from 'components/ui/form';
import ChangeEmail from 'components/profile/changeEmail/ChangeEmail';

class ProfileChangeEmailPage extends Component {
    static displayName = 'ProfileChangeEmailPage';

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
        }).isRequired
    };

    form = new FormModel();

    componentWillMount() {
        const step = this.props.params.step;

        if (step && !/^step\d$/.test(step)) {
            // wrong param value
            // TODO: probably we should decide with something better here
            this.context.router.push('/');
        }
    }

    render() {
        const {params: {step, code}} = this.props;

        return (
            <ChangeEmail form={this.form}
                onSubmit={this.onSubmit}
                email={this.props.email}
                step={step ? step.slice(-1) * 1 - 1 : step}
                onChangeStep={this.onChangeStep}
                code={code}
            />
        );
    }

    onChangeStep = (step) => {
        this.context.router.push(`/profile/change-email/step${++step}`);
    };

    onSubmit = () => {
    };
}

import { connect } from 'react-redux';

export default connect((state) => ({
    email: state.user.email
}), {
})(ProfileChangeEmailPage);
