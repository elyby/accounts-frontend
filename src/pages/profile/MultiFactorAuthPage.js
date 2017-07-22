import React, { Component, PropTypes } from 'react';

import MultiFactorAuth from 'components/profile/multiFactorAuth';

import accounts from 'services/api/accounts';

class MultiFactorAuthPage extends Component {
    static propTypes = {
        email: PropTypes.string.isRequired,
        lang: PropTypes.string.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func
        }).isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                step: PropTypes.oneOf(['step1', 'step2', 'step3']),
                code: PropTypes.string
            })
        })
    };

    static contextTypes = {
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired
    };

    componentWillMount() {
        const step = this.props.match.params.step;

        if (step && !/^step[123]$/.test(step)) {
            // wrong param value
            this.props.history.push('/404');
        }
    }

    render() {
        const {step = 'step1', code} = this.props.match.params;

        return (
            <MultiFactorAuth
                onSubmit={this.onSubmit}
                email={this.props.email}
                lang={this.props.lang}
                step={step.slice(-1) * 1 - 1}
                onChangeStep={this.onChangeStep}
                code={code}
            />
        );
    }

    onChangeStep = (step) => {
        this.props.history.push(`/profile/mfa/step${++step}`);
    };

    onSubmit = (step, form) => {
        return this.context.onSubmit({
            form,
            sendData: () => {
                const data = form.serialize();

                switch (step) {
                    case 0:
                        return accounts.requestEmailChange(data).catch(handleErrors());
                    case 1:
                        return accounts.setNewEmail(data).catch(handleErrors('/profile/change-email'));
                    case 2:
                        return accounts.confirmNewEmail(data).catch(handleErrors('/profile/change-email'));
                    default:
                        throw new Error(`Unsupported step ${step}`);
                }
            }
        }).then(() => {
            step > 1 && this.context.goToProfile();
        });
    };
}

function handleErrors(repeatUrl) {
    return (resp) => {
        if (resp.errors) {
            if (resp.errors.key) {
                resp.errors.key = {
                    type: resp.errors.key,
                    payload: {}
                };

                if (['error.key_not_exists', 'error.key_expire'].includes(resp.errors.key.type) && repeatUrl) {
                    Object.assign(resp.errors.key.payload, {
                        repeatUrl
                    });
                }
            }
        }

        return Promise.reject(resp);
    };
}

import { connect } from 'react-redux';

export default connect((state) => ({
    email: state.user.email,
    lang: state.user.lang
}), {
})(MultiFactorAuthPage);
