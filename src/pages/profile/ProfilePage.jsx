import React, { Component, PropTypes } from 'react';

import styles from './profile.scss';

class ProfilePage extends Component {
    displayName = 'ProfilePage';

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired,
        children: PropTypes.element
    };

    static childContextTypes = {
        onSubmit: PropTypes.func,
        goToProfile: PropTypes.func
    };

    getChildContext() {
        return {
            onSubmit: this.props.onSubmit,
            goToProfile: this.props.goToProfile
        };
    }

    render() {
        return (
            <div className={styles.container}>
                {this.props.children}
            </div>
        );
    }
}

import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';
import { create as createPopup } from 'components/ui/popup/actions';
import PasswordRequestForm from 'components/profile/passwordRequestForm/PasswordRequestForm';

export default connect(null, {
    goToProfile() {
        return routeActions.push('/');
    },
    onSubmit: ({form, sendData}) => (dispatch) =>
        sendData()
            .catch((resp) => {
                const requirePassword = resp.errors && !!resp.errors.password;

                // prevalidate user input, because requestPassword popup will block the
                // entire form from input, so it must be valid
                if (resp.errors) {
                    Reflect.deleteProperty(resp.errors, 'password');

                    if (Object.keys(resp.errors).length) {
                        form.setErrors(resp.errors);
                        return Promise.reject(resp);
                    }

                    return Promise.resolve({requirePassword});
                }
            })
            .then((resp) => new Promise((resolve) => {
                if (resp.requirePassword) {
                    dispatch(createPopup(PasswordRequestForm, (props) => ({
                        form,
                        onSubmit: () => {
                            sendData()
                            .catch((resp) => {
                                if (resp.errors) {
                                    form.setErrors(resp.errors);
                                }

                                return Promise.reject(resp);
                            })
                            .then(resolve)
                            .then(props.onClose);
                        }
                    })));
                } else {
                    resolve();
                }
            }))
})(ProfilePage);
