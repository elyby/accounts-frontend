import { OAuthState } from 'app/components/auth/reducer';
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

function hasPrompt(prompt: OAuthState['prompt'], needle: string): boolean {
    if (Array.isArray(prompt)) {
        return prompt.includes(needle);
    }

    return prompt === needle;
}

export default class CompleteState extends AbstractState {
    isPermissionsAccepted?: boolean;

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
            auth: { credentials, oauth },
            user,
        } = context.getState();

        if (credentials.isActivationRequired) {
            context.setState(new ActivationState());
        } else if (user.isGuest) {
            context.setState(new LoginState());
        } else if (user.shouldAcceptRules && !user.isDeleted) {
            context.setState(new AcceptRulesState());
        } else if (oauth?.params) {
            return this.processOAuth(context);
        } else {
            context.navigate('/');
        }
    }

    processOAuth(context: AuthContext): Promise<void> | void {
        const { auth, accounts, user } = context.getState();

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

        if (
            isSwitcherEnabled &&
            (accounts.available.length > 1 ||
                // we are always showing account switcher for deleted users
                // so that they can see, that their account was deleted
                // (this info is displayed on switcher)
                user.isDeleted ||
                hasPrompt(oauth.prompt, PROMPT_ACCOUNT_CHOOSE))
        ) {
            return context.setState(new ChooseAccountState());
        }

        if (user.isDeleted) {
            // you shall not pass
            // if we are here, this means that user have already seen account
            // switcher and now we should redirect him to his profile,
            // because oauth is not available for deleted accounts
            return context.navigate('/');
        }

        if (oauth.code) {
            return context.setState(new FinishState());
        }

        const data: Record<string, any> = {};

        if (typeof this.isPermissionsAccepted !== 'undefined') {
            data.accept = this.isPermissionsAccepted;
        } else if (oauth.acceptRequired || hasPrompt(oauth.prompt, PROMPT_PERMISSIONS)) {
            context.setState(new PermissionsState());

            return;
        }

        // TODO: it seems that oAuthComplete may be a separate state
        return context
            .run('oAuthComplete', data)
            .then((resp: { redirectUri?: string }) => {
                // TODO: пусть в стейт попадает флаг или тип авторизации
                //       вместо волшебства над редирект урлой
                if (!resp.redirectUri || resp.redirectUri.includes('static_page')) {
                    context.setState(new FinishState());
                } else {
                    return context.run('redirect', resp.redirectUri);
                }
            })
            .catch((resp) => {
                if (resp.unauthorized) {
                    context.setState(new LoginState());
                } else if (resp.acceptRequired) {
                    context.setState(new PermissionsState());
                }
            });
    }
}
