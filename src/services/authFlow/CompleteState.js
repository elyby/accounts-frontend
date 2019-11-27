// @flow
import { getActiveAccount } from 'components/accounts/reducer';
import AbstractState from './AbstractState';
import LoginState from './LoginState';
import PermissionsState from './PermissionsState';
import ChooseAccountState from './ChooseAccountState';
import ActivationState from './ActivationState';
import AcceptRulesState from './AcceptRulesState';
import FinishState from './FinishState';
import type { AuthContext } from './AuthFlow';

const PROMPT_ACCOUNT_CHOOSE = 'select_account';
const PROMPT_PERMISSIONS = 'consent';

export default class CompleteState extends AbstractState {
  isPermissionsAccepted: boolean | void;

  constructor(
    options: {
      accept?: boolean,
    } = {},
  ) {
    super();

    this.isPermissionsAccepted = options.accept;
  }

  enter(context: AuthContext) {
    const { auth = {}, user } = context.getState();

    if (user.isGuest) {
      context.setState(new LoginState());
    } else if (!user.isActive) {
      context.setState(new ActivationState());
    } else if (user.shouldAcceptRules) {
      context.setState(new AcceptRulesState());
    } else if (auth.oauth && auth.oauth.clientId) {
      return this.processOAuth(context);
    } else {
      context.navigate('/');
    }
  }

  processOAuth(context: AuthContext) {
    const { auth = {}, accounts } = context.getState();

    let { isSwitcherEnabled } = auth;
    const { loginHint } = auth.oauth;

    if (loginHint) {
      const account = accounts.available.filter(
        account =>
          account.id === loginHint * 1 ||
          account.email === loginHint ||
          account.username === loginHint,
      )[0];
      const activeAccount = getActiveAccount(context.getState());

      if (account) {
        // disable switching, because we are know the account, user must be authorized with
        context.run('setAccountSwitcher', false);
        isSwitcherEnabled = false;

        if (!activeAccount || account.id !== activeAccount.id) {
          // lets switch user to an account, that is needed for auth
          return context
            .run('authenticate', account)
            .then(() => context.setState(new CompleteState()));
        }
      }
    }

    if (
      isSwitcherEnabled &&
      (accounts.available.length > 1 ||
        auth.oauth.prompt.includes(PROMPT_ACCOUNT_CHOOSE))
    ) {
      context.setState(new ChooseAccountState());
    } else if (auth.oauth.code) {
      context.setState(new FinishState());
    } else {
      const data = {};

      if (typeof this.isPermissionsAccepted !== 'undefined') {
        data.accept = this.isPermissionsAccepted;
      } else if (
        auth.oauth.acceptRequired ||
        auth.oauth.prompt.includes(PROMPT_PERMISSIONS)
      ) {
        context.setState(new PermissionsState());

        return;
      }

      // TODO: it seems that oAuthComplete may be a separate state
      return context.run('oAuthComplete', data).then(
        (resp: { redirectUri: string }) => {
          // TODO: пусть в стейт попадает флаг или тип авторизации
          // вместо волшебства над редирект урлой
          if (resp.redirectUri.indexOf('static_page') === 0) {
            context.setState(new FinishState());
          } else {
            return context.run('redirect', resp.redirectUri);
          }
        },
        resp => {
          if (resp.unauthorized) {
            context.setState(new LoginState());
          } else if (resp.acceptRequired) {
            context.setState(new PermissionsState());
          }
        },
      );
    }
  }
}
