import React, { Component, PropTypes } from 'react';

import accounts from 'services/api/accounts';
import ChangePassword from 'components/profile/changePassword/ChangePassword';
import PasswordRequestForm from 'components/profile/passwordRequestForm/PasswordRequestForm';

class ChangePasswordPage extends Component {
    static displayName = 'ChangePasswordPage';

    static propTypes = {
        changePassword: PropTypes.func.isRequired
    };

    render() {
        return (
            <ChangePassword onSubmit={this.onSubmit} />
        );
    }

    onSubmit = (data) => {
        this.props.changePassword(data);
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
    changePassword: (data) => {
        return (dispatch) => {
            dispatch(registerPopup('requestPassword', PasswordRequestForm));
            dispatch(createPopup('requestPassword', (props) => {
                return {
                    onSubmit: (password) => {
                        // TODO: hide this logic in action
                        accounts.changePassword({
                            ...data,
                            password
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
