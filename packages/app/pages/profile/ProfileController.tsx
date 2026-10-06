import React, { ComponentType, useCallback } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { connect } from 'app/functions';
import { Dispatch } from 'app/types';
import { refreshUserData } from 'app/components/accounts/actions';
import { create as createPopup } from 'app/components/ui/popup/actions';
import PasswordRequestForm from 'app/components/profile/passwordRequestForm';
import logger from 'app/services/logger';
import { ValidationError } from 'app/services/request';
import { browserHistory } from 'app/services/history';
import { FooterMenu } from 'app/components/footerMenu';
import { FormModel } from 'app/components/ui/form';
import type { ValidationError as FormValidationError } from 'app/components/ui/form/FormModel';
import { Provider } from 'app/components/profile/Context';
import { User } from 'app/components/user';

import styles from './profile.scss';

import Profile from 'app/pages/profile/ProfilePage';
import ChangePasswordPage from 'app/pages/profile/ChangePasswordPage';
import ChangeUsernamePage from 'app/pages/profile/ChangeUsernamePage';
import ChangeEmailPage from 'app/pages/profile/ChangeEmailPage';
import MultiFactorAuthPage from 'app/pages/profile/MultiFactorAuthPage';
import DeleteAccountPage from 'app/pages/profile/DeleteAccountPage';
import AccountDeletedPage from 'app/pages/profile/AccountDeletedPage';

interface Props {
    user: User;
    onSubmit: (options: { form: FormModel; sendData: () => Promise<any> }) => Promise<void>;
    refreshUserData: () => Promise<any>;
}

const ProfileController: ComponentType<Props> = ({ user, onSubmit, refreshUserData }) => {
    const goToProfile = useCallback(async () => {
        await refreshUserData();

        browserHistory.push('/');
    }, [refreshUserData]);

    return (
        <div className={styles.container}>
            <Provider
                value={{
                    userId: user.id!,
                    onSubmit,
                    goToProfile,
                }}
            >
                {user.isDeleted ? (
                    <Switch>
                        <Route path="/" exact component={AccountDeletedPage} />
                        <Redirect to="/" />
                    </Switch>
                ) : (
                    <Switch>
                        <Route path="/profile/mfa/step:step([1-3])" component={MultiFactorAuthPage} />
                        <Route path="/profile/mfa" exact component={MultiFactorAuthPage} />
                        <Route path="/profile/change-password" exact component={ChangePasswordPage} />
                        <Route path="/profile/change-username" exact component={ChangeUsernamePage} />
                        <Route path="/profile/change-email/:step?/:code?" component={ChangeEmailPage} />
                        <Route path="/profile/delete" component={DeleteAccountPage} />
                        <Route path="/profile" exact component={Profile} />
                        <Route path="/" exact component={Profile} />
                        <Redirect to="/404" />
                    </Switch>
                )}

                <div className={styles.footer}>
                    <FooterMenu />
                </div>
            </Provider>
        </div>
    );
};

export default connect(
    (state) => ({
        user: state.user,
    }),
    {
        refreshUserData,
        onSubmit:
            ({ form, sendData, repeatUrl }: { form: FormModel; sendData: () => Promise<any>; repeatUrl?: string }) =>
            (dispatch: Dispatch) => {
                form.beginLoading();

                return sendData()
                    .catch((resp) => {
                        if (!(resp instanceof ValidationError)) {
                            return Promise.reject(resp);
                        }

                        // prevalidate user input, because requestPassword popup will block the
                        // entire form from input, so it must be valid
                        const { password, ...errors } = formatErrors(resp, repeatUrl);

                        if (Object.keys(errors).length) {
                            form.setErrors(errors);

                            return Promise.reject(resp);
                        }

                        if (password) {
                            return requestPassword(form);
                        }

                        return Promise.reject(resp);
                    })
                    .catch((resp) => {
                        // Validation errors are already shown in the form
                        if (resp instanceof ValidationError) {
                            return Promise.reject(resp);
                        }

                        logger.warn('Unexpected profile editing error', {
                            resp,
                        });
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
                                                if (resp instanceof ValidationError) {
                                                    const errors = formatErrors(resp, repeatUrl);
                                                    form.setErrors(errors);

                                                    const parentFormHasErrors =
                                                        Object.keys(errors).filter((name) => name !== 'password')
                                                            .length > 0;

                                                    if (parentFormHasErrors) {
                                                        // something wrong with parent form, hiding popup and show that form
                                                        props.onClose();
                                                        reject(resp);
                                                    }
                                                } else {
                                                    return Promise.reject(resp);
                                                }
                                            })
                                            .finally(() => form.endLoading());
                                    };

                                    return <PasswordRequestForm form={form} onSubmit={onSubmit} />;
                                },
                                // TODO: this property should be automatically extracted from the popup's isClosable prop
                                disableOverlayClose: true,
                            }),
                        );
                    });
                }
            },
    },
)(ProfileController);

/**
 * Converts the error codes into the form errors, adding the data, that is required to display them
 * @param error
 * @param repeatUrl - where the user can repeat the process, when the key has expired
 */
function formatErrors(error: ValidationError, repeatUrl?: string): Record<string, FormValidationError> {
    const errors: Record<string, FormValidationError> = { ...error.errors };
    const { canRepeatIn } = error.data;

    if (error.errors.email && canRepeatIn) {
        errors.email = {
            type: error.errors.email,
            payload: {
                msLeft: canRepeatIn * 1000,
            },
        };
    }

    if (error.errors.key) {
        const isKeyExpired = ['error.key_not_exists', 'error.key_expire'].includes(error.errors.key);

        errors.key = {
            type: error.errors.key,
            payload: isKeyExpired && repeatUrl ? { repeatUrl } : {},
        };
    }

    return errors;
}
