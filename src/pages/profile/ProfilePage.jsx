import React, { Component, PropTypes } from 'react';

import logger from 'services/logger';

import { FooterMenu } from 'components/footerMenu';

import styles from './profile.scss';

class ProfilePage extends Component {
    displayName = 'ProfilePage';

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        fetchUserData: PropTypes.func.isRequired,
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
            goToProfile: () => this.props.fetchUserData().then(this.props.goToProfile)
        };
    }

    render() {
        return (
            <div className={styles.container}>
                {this.props.children}

                <div className={styles.footer}>
                    <FooterMenu />
                </div>
            </div>
        );
    }
}

import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';
import { fetchUserData } from 'components/user/actions';
import { create as createPopup } from 'components/ui/popup/actions';
import PasswordRequestForm from 'components/profile/passwordRequestForm/PasswordRequestForm';

export default connect(null, {
    goToProfile() {
        return routeActions.push('/');
    },
    fetchUserData,
    onSubmit: ({form, sendData}) => (dispatch) => {
        form.beginLoading();
        return sendData()
            .catch((resp) => {
                const requirePassword = resp.errors && !!resp.errors.password;

                // prevalidate user input, because requestPassword popup will block the
                // entire form from input, so it must be valid
                if (resp.errors) {
                    Reflect.deleteProperty(resp.errors, 'password');

                    if (resp.errors.email && resp.data && resp.data.canRepeatIn) {
                        resp.errors.email = {
                            type: resp.errors.email,
                            payload: {
                                msLeft: resp.data.canRepeatIn * 1000
                            }
                        };
                    }

                    if (Object.keys(resp.errors).length) {
                        form.setErrors(resp.errors);
                        return Promise.reject(resp);
                    }

                    return Promise.resolve({requirePassword});
                }
            })
            .then((resp) => !resp.requirePassword || requestPassword(form))
            .catch((resp) => {
                if (!resp || !resp.errors) {
                    logger.warn('Unexpected profile editing error', {
                        resp
                    });
                }
            })
            .finally(() => form.endLoading());

        function requestPassword(form) {
            return new Promise((resolve) => {
                dispatch(createPopup({
                    Popup(props) {
                        const onSubmit = () => {
                            form.beginLoading();
                            sendData()
                                .then(resolve)
                                .then(props.onClose)
                                .catch((resp) => {
                                    if (resp.errors) {
                                        form.setErrors(resp.errors);
                                    } else {
                                        return Promise.reject(resp);
                                    }
                                })
                                .finally(() => form.endLoading());
                        };

                        return <PasswordRequestForm form={form} onSubmit={onSubmit} />;
                    },
                    disableOverlayClose: true
                }));
            });
        }
    }
})(ProfilePage);
