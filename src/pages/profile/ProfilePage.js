// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Route, Switch, Redirect } from 'react-router-dom';

import logger from 'services/logger';
import { browserHistory } from 'services/history';
import Profile from 'components/profile/Profile';
import ChangePasswordPage from 'pages/profile/ChangePasswordPage';
import ChangeUsernamePage from 'pages/profile/ChangeUsernamePage';
import ChangeEmailPage from 'pages/profile/ChangeEmailPage';

import { FooterMenu } from 'components/footerMenu';

import styles from './profile.scss';

import type { FormModel } from 'components/ui/form';

class ProfilePage extends Component {
    props: {
        onSubmit: ({form: FormModel, sendData: () => Promise<*>}) => void,
        fetchUserData: () => Promise<*>
    };

    static childContextTypes = {
        onSubmit: PropTypes.func,
        goToProfile: PropTypes.func
    };

    getChildContext() {
        return {
            onSubmit: this.props.onSubmit,
            goToProfile: () => this.props.fetchUserData().then(this.goToProfile)
        };
    }

    render() {
        return (
            <div className={styles.container}>
                <Switch>
                    <Route path="/profile/change-password" component={ChangePasswordPage} />
                    <Route path="/profile/change-username" component={ChangeUsernamePage} />
                    <Route path="/profile/change-email/:step?/:code?" component={ChangeEmailPage} />
                    <Route path="/profile" component={Profile} />
                    <Route path="/" exact component={Profile} />
                    <Redirect to="/404" />
                </Switch>

                <div className={styles.footer}>
                    <FooterMenu />
                </div>
            </div>
        );
    }

    goToProfile = () => browserHistory.push('/');
}

import { connect } from 'react-redux';
import { fetchUserData } from 'components/user/actions';
import { create as createPopup } from 'components/ui/popup/actions';
import PasswordRequestForm from 'components/profile/passwordRequestForm/PasswordRequestForm';

export default connect(null, {
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
                } else {
                    return Promise.reject(resp);
                }
            })
            .finally(() => form.endLoading());

        function requestPassword(form) {
            return new Promise((resolve) => {
                dispatch(createPopup({
                    Popup(props: {
                        onClose: Function
                    }) {
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
