import React, { Component, PropTypes } from 'react';

import accounts from 'services/api/accounts';
import FormModel from 'models/Form';
import ChangePassword from 'components/profile/changePassword/ChangePassword';
import PasswordRequestForm from 'components/profile/passwordRequestForm/PasswordRequestForm';

class ChangePasswordPage extends Component {
    static displayName = 'ChangePasswordPage';

    static propTypes = {
        changePassword: PropTypes.func.isRequired
    };

    form = new FormModel();

    render() {
        return (
            <ChangePassword onSubmit={this.onSubmit} form={this.form} />
        );
    }

    onSubmit = () => {
        this.props.changePassword(this.form);
    };
}

import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';
import { register as registerPopup, create as createPopup } from 'components/ui/popup/actions';
import { updateUser } from 'components/user/actions';

function goToProfile() {
    return routeActions.push('/');
}

export default connect(null, {
    changePassword: (form) => {
        return (dispatch) => {
            // TODO: судя по всему registerPopup было явно лишним. Надо еще раз
            // обдумать API и переписать
            dispatch(registerPopup('requestPassword', PasswordRequestForm));
            dispatch(createPopup('requestPassword', (props) => {
                return {
                    form,
                    onSubmit: () => {
                        // TODO: hide this logic in action
                        accounts.changePassword(form.serialize())
                        .catch((resp) => {
                            if (resp.errors) {
                                form.setErrors(resp.errors);
                            }

                            return Promise.reject(resp);
                        })
                        .then(() => {
                            dispatch(updateUser({
                                passwordChangedAt: Date.now() / 1000,
                                shouldChangePassword: false
                            }));
                        })
                        .then(props.onClose)
                        .then(() => dispatch(goToProfile()));
                    }
                };
            }));
        };
    }
})(ChangePasswordPage);
