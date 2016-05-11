import React, { Component, PropTypes } from 'react';

import accounts from 'services/api/accounts';
import { FormModel } from 'components/ui/form';
import ChangeUsername from 'components/profile/changeUsername/ChangeUsername';
import PasswordRequestForm from 'components/profile/passwordRequestForm/PasswordRequestForm';

class ChangeUsernamePage extends Component {
    static displayName = 'ChangeUsernamePage';

    static propTypes = {
        username: PropTypes.string.isRequired,
        updateUsername: PropTypes.func.isRequired, // updates username in state
        changeUsername: PropTypes.func.isRequired // saves username to backend
    };

    form = new FormModel();

    componentWillMount() {
        this.setState({
            actualUsername: this.props.username
        });
    }

    componentWillUnmount() {
        this.props.updateUsername(this.state.actualUsername);
    }

    render() {
        return (
            <ChangeUsername form={this.form}
                onSubmit={this.onSubmit}
                onChange={this.onUsernameChange}
                username={this.props.username}
            />
        );
    }

    onUsernameChange = (username) => {
        this.props.updateUsername(username);
    };

    onSubmit = () => {
        this.props.changeUsername(this.form).then(() => {
            this.setState({
                actualUsername: this.props.username
            });
        });
    };
}

import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';
import { create as createPopup } from 'components/ui/popup/actions';
import { updateUser } from 'components/user/actions';

function goToProfile() {
    return routeActions.push('/');
}

export default connect((state) => ({
    username: state.user.username
}), {
    updateUsername: (username) => {
        return updateUser({username});
    },
    changeUsername: (form) => {
        return (dispatch) => accounts.changeUsername(form.serialize())
            .catch((resp) => {
                // prevalidate user input, because requestPassword popup will block the
                // entire form from input, so it must be valid
                if (resp.errors) {
                    Reflect.deleteProperty(resp.errors, 'password');

                    if (Object.keys(resp.errors).length) {
                        form.setErrors(resp.errors);
                        return Promise.reject(resp);
                    }
                }

                return Promise.resolve();
            })
            .then(() => {
                return new Promise((resolve) => {
                    dispatch(createPopup(PasswordRequestForm, (props) => ({
                        form,
                        onSubmit: () => {
                            // TODO: hide this logic in action
                            accounts.changeUsername(form.serialize())
                            .catch((resp) => {
                                if (resp.errors) {
                                    form.setErrors(resp.errors);
                                }

                                return Promise.reject(resp);
                            })
                            .then(() => {
                                dispatch(updateUser({
                                    username: form.value('username')
                                }));
                            })
                            .then(resolve)
                            .then(props.onClose)
                            .then(() => dispatch(goToProfile()));
                        }
                    })));
                });
            })
        ;
    }
})(ChangeUsernamePage);
