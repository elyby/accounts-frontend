import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { refreshUserData } from 'app/components/accounts/actions';
import { create as createPopup } from 'app/components/ui/popup/actions';
import PasswordRequestForm from 'app/components/profile/passwordRequestForm/PasswordRequestForm';
import logger from 'app/services/logger';
import { browserHistory } from 'app/services/history';
import { FooterMenu } from 'app/components/footerMenu';
import { FormModel } from 'app/components/ui/form';
import { Dispatch, RootState } from 'app/reducers';
import { Provider } from 'app/components/profile/Context';
import { ComponentLoader } from 'app/components/ui/loader';

import styles from './profile.scss';

const Profile = React.lazy(() => import(/* webpackChunkName: "page-profile-index" */ 'app/components/profile/Profile'));
const ChangePasswordPage = React.lazy(() =>
    import(/* webpackChunkName: "page-profile-change-password" */ 'app/pages/profile/ChangePasswordPage'),
);
const ChangeUsernamePage = React.lazy(() =>
    import(/* webpackChunkName: "page-profile-change-username" */ 'app/pages/profile/ChangeUsernamePage'),
);
const ChangeEmailPage = React.lazy(() =>
    import(/* webpackChunkName: "page-profile-change-email" */ 'app/pages/profile/ChangeEmailPage'),
);
const MultiFactorAuthPage = React.lazy(() =>
    import(/* webpackChunkName: "page-profile-mfa" */ 'app/pages/profile/MultiFactorAuthPage'),
);

interface Props {
    userId: number;
    onSubmit: (options: { form: FormModel; sendData: () => Promise<any> }) => Promise<void>;
    refreshUserData: () => Promise<any>;
}

class ProfilePage extends React.Component<Props> {
    render() {
        const { userId, onSubmit } = this.props;

        return (
            <div className={styles.container}>
                <Provider
                    value={{
                        userId,
                        onSubmit,
                        goToProfile: this.goToProfile,
                    }}
                >
                    <React.Suspense fallback={<ComponentLoader />}>
                        <Switch>
                            <Route path="/profile/mfa/step:step([1-3])" component={MultiFactorAuthPage} />
                            <Route path="/profile/mfa" exact component={MultiFactorAuthPage} />
                            <Route path="/profile/change-password" exact component={ChangePasswordPage} />
                            <Route path="/profile/change-username" exact component={ChangeUsernamePage} />
                            <Route path="/profile/change-email/:step?/:code?" component={ChangeEmailPage} />
                            <Route path="/profile" exact component={Profile} />
                            <Route path="/" exact component={Profile} />
                            <Redirect to="/404" />
                        </Switch>
                    </React.Suspense>

                    <div className={styles.footer}>
                        <FooterMenu />
                    </div>
                </Provider>
            </div>
        );
    }

    goToProfile = async () => {
        await this.props.refreshUserData();

        browserHistory.push('/');
    };
}

export default connect(
    (state: RootState) => ({
        userId: state.user.id!,
    }),
    {
        refreshUserData,
        onSubmit: ({ form, sendData }: { form: FormModel; sendData: () => Promise<any> }) => (dispatch: Dispatch) => {
            form.beginLoading();

            return sendData()
                .catch((resp) => {
                    const requirePassword = resp.errors && !!resp.errors.password;

                    // prevalidate user input, because requestPassword popup will block the
                    // entire form from input, so it must be valid
                    if (resp.errors) {
                        delete resp.errors.password;

                        if (resp.errors.email && resp.data && resp.data.canRepeatIn) {
                            resp.errors.email = {
                                type: resp.errors.email,
                                payload: {
                                    msLeft: resp.data.canRepeatIn * 1000,
                                },
                            };
                        }

                        if (Object.keys(resp.errors).length) {
                            form.setErrors(resp.errors);

                            return Promise.reject(resp);
                        }

                        if (requirePassword) {
                            return requestPassword(form);
                        }
                    }

                    return Promise.reject(resp);
                })
                .catch((resp) => {
                    if (!resp || !resp.errors) {
                        logger.warn('Unexpected profile editing error', {
                            resp,
                        });
                    } else {
                        return Promise.reject(resp);
                    }
                })
                .finally(() => form.endLoading());

            function requestPassword(form: FormModel) {
                return new Promise((resolve, reject) => {
                    dispatch(
                        createPopup({
                            Popup(props: { onClose: () => Promise<any> }) {
                                const onSubmit = () => {
                                    form.beginLoading();

                                    sendData()
                                        .then(resolve)
                                        .then(props.onClose)
                                        .catch((resp) => {
                                            if (resp.errors) {
                                                form.setErrors(resp.errors);

                                                const parentFormHasErrors =
                                                    Object.keys(resp.errors).filter((name) => name !== 'password')
                                                        .length > 0;

                                                if (parentFormHasErrors) {
                                                    // something wrong with parent form, hiding popup and show that form
                                                    props.onClose();
                                                    reject(resp);
                                                    logger.warn(
                                                        'Profile: can not submit password popup due to errors in source form',
                                                        { resp },
                                                    );
                                                }
                                            } else {
                                                return Promise.reject(resp);
                                            }
                                        })
                                        .finally(() => form.endLoading());
                                };

                                return <PasswordRequestForm form={form} onSubmit={onSubmit} />;
                            },
                            disableOverlayClose: true,
                        }),
                    );
                });
            }
        },
    },
)(ProfilePage);
