import { getActiveAccount } from 'app/components/accounts/reducer';
import AbstractState from './AbstractState';
import LoginState from './LoginState';
import PermissionsState from './PermissionsState';
import ChooseAccountState from './ChooseAccountState';
import ActivationState from './ActivationState';
import AcceptRulesState from './AcceptRulesState';
import FinishState from './FinishState';
import { AuthContext } from './AuthFlow';

const PROMPT_ACCOUNT_CHOOSE = 'select_account';
const PROMPT_PERMISSIONS = 'consent';

export default class CompleteState extends AbstractState {
    isPermissionsAccepted: boolean | void;

    constructor(
        options: {
            accept?: boolean;
        } = {},
    ) {
        super();

        this.isPermissionsAccepted = options.accept;
    }

    enter(context: AuthContext): Promise<void> | void {
        const {
            auth: { oauth },
            user,
        } = context.getState();

        if (user.isGuest) {
            context.setState(new LoginState());
        } else if (!user.isActive) {
            context.setState(new ActivationState());
        } else if (user.isDeleted) {
            context.navigate('/');
        } else if (user.shouldAcceptRules) {
            context.setState(new AcceptRulesState());
        } else if (oauth && oauth.clientId) {
            return this.processOAuth(context);
        } else {
            context.navigate('/');
        }
    }

    processOAuth(context: AuthContext): Promise<void> | void {
        const { auth, accounts } = context.getState();

        let { isSwitcherEnabled } = auth;
        const { oauth } = auth;

        if (!oauth) {
            throw new Error('Empty oauth state');
        }

        const { loginHint } = oauth;

        if (loginHint) {
            const account = accounts.available.find(
                (item) => item.id === Number(loginHint) || item.email === loginHint || item.username === loginHint,
            );
            const activeAccount = getActiveAccount(context.getState());

            if (account) {
                // disable switching, because we are know the account, user must be authorized with
                context.run('setAccountSwitcher', false);
                isSwitcherEnabled = false;

                if (!activeAccount || account.id !== activeAccount.id) {
                    // lets switch user to an account, that is needed for auth
                    return context.run('authenticate', account).then(() => context.setState(new CompleteState()));
                }
            }
        }

        if (isSwitcherEnabled && (accounts.available.length > 1 || oauth.prompt.includes(PROMPT_ACCOUNT_CHOOSE))) {
            context.setState(new ChooseAccountState());
        } else if (oauth.code) {
            context.setState(new FinishState());
        } else {
            const data: { [key: string]: any } = {};

            if (typeof this.isPermissionsAccepted !== 'undefined') {
                data.accept = this.isPermissionsAccepted;
            } else if (oauth.acceptRequired || oauth.prompt.includes(PROMPT_PERMISSIONS)) {
                context.setState(new PermissionsState());

                return;
            }

            // TODO: it seems that oAuthComplete may be a separate state
            return context.run('oAuthComplete', data).then(
                (resp: { redirectUri: string }) => {
                    // TODO: пусть в стейт попадает флаг или тип авторизации
                    // вместо волшебства над редирект урлой
                    if (resp.redirectUri.includes('static_page')) {
                        context.setState(new FinishState());
                    } else {
                        return context.run('redirect', resp.redirectUri);
                    }
                },
                (resp) => {
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
