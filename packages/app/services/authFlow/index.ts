import * as actions from 'app/components/auth/actions';
import { updateUser } from 'app/components/user/actions';
import {
  authenticate,
  logoutAll as logout,
  remove as removeAccount,
  activate as activateAccount,
} from 'app/components/accounts/actions';

import AuthFlow, { ActionsDict, AuthContext as TAuthContext } from './AuthFlow';

const availableActions = {
  updateUser,
  authenticate,
  activateAccount,
  removeAccount,
  logout,
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
  setLoadingState: actions.setLoadingState,
};

export type AuthContext = TAuthContext;
export default new AuthFlow(availableActions as ActionsDict);
