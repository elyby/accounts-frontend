// @flow
import type { RouterHistory, Match } from 'react-router';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import ChangeEmail from 'components/profile/changeEmail/ChangeEmail';

import { requestEmailChange, setNewEmail, confirmNewEmail } from 'services/api/accounts';

interface Props {
    lang: string;
    email: string;
    history: RouterHistory;
    match: {
        ...Match;
        params: {
            step: 'step1' | 'step2' | 'step3';
            code: string;
        };
    };
}

class ChangeEmailPage extends Component<Props> {
    static displayName = 'ChangeEmailPage';

    static contextTypes = {
        userId: PropTypes.number.isRequired,
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired,
    };

    componentWillMount() {
        const { step } = this.props.match.params;

        if (step && !/^step[123]$/.test(step)) {
            // wrong param value
            this.props.history.push('/404');
        }
    }

    render() {
        const { step = 'step1', code } = this.props.match.params;

        return (
            <ChangeEmail
                onSubmit={this.onSubmit}
                email={this.props.email}
                lang={this.props.lang}
                step={((step.slice(-1): any): number) * 1 - 1}
                onChangeStep={this.onChangeStep}
                code={code}
            />
        );
    }

    onChangeStep = (step) => {
        this.props.history.push(`/profile/change-email/step${++step}`);
    };

    onSubmit = (step: number, form) => {
        return this.context.onSubmit({
            form,
            sendData: () => {
                const { userId } = this.context;
                const data = form.serialize();

                switch (step) {
                    case 0:
                        return requestEmailChange(userId, data.password).catch(handleErrors());
                    case 1:
                        return setNewEmail(userId, data.email, data.key).catch(handleErrors('/profile/change-email'));
                    case 2:
                        return confirmNewEmail(userId, data.key).catch(handleErrors('/profile/change-email'));
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
})(ChangeEmailPage);
