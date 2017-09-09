// @flow
import AuthFlow from './AuthFlow';
export type {AuthContext} from './AuthFlow';

import * as actions from 'components/auth/actions';

const availableActions = {
    updateUser: actions.updateUser,
    authenticate: actions.authenticate,
    logout: actions.logout,
    goBack: actions.goBack,
    redirect: actions.redirect,
    login: actions.login,
    acceptRules: actions.acceptRules,
    forgotPassword: actions.forgotPassword,
    recoverPassword: actions.recoverPassword,
    register: actions.register,
    activate: actions.activate,
    resendActivation: actions.resendActivation,
    contactUs: actions.contactUs,
    setLogin: actions.setLogin,
    setAccountSwitcher: actions.setAccountSwitcher,
    setErrors: actions.setErrors,
    clearErrors: actions.clearErrors,
    oAuthValidate: actions.oAuthValidate,
    oAuthComplete: actions.oAuthComplete,
    setClient: actions.setClient,
    resetOAuth: actions.resetOAuth,
    resetAuth: actions.resetAuth,
    setOAuthRequest: actions.setOAuthRequest,
    setOAuthCode: actions.setOAuthCode,
    requirePermissionsAccept: actions.requirePermissionsAccept,
    setScopes: actions.setScopes,
    setLoadingState: actions.setLoadingState
};

export default new AuthFlow(availableActions);
