import {
    type OAuthState,
    PROMPT_ACCOUNT_CHOOSE,
    PROMPT_LOGIN,
    PROMPT_NONE,
    PROMPT_PERMISSIONS,
    PROMPT_SKIP_ACCOUNT_CHOOSE,
} from 'app/components/auth/reducer';
import { getActiveAccount } from 'app/components/accounts/reducer';
import { OAuthError, UnauthorizedError } from 'app/services/request';

import AbstractState from './AbstractState';
import LoginState from './LoginState';
import PasswordState from './PasswordState';
import PermissionsState from './PermissionsState';
import ChooseAccountState from './ChooseAccountState';
import ActivationState from './ActivationState';
import AcceptRulesState from './AcceptRulesState';
import FinishState from './FinishState';
import { AuthContext } from './AuthFlow';

function toArray(input: string|Array<string>|null|undefined): Array<string> {
    if (Array.isArray(input)) {
        return input;
    }

    return input ? [input] : [];
}

function hasPrompt(prompt: OAuthState['prompt'], needle: string): boolean {
    return toArray(prompt).includes(needle);
}

/**
 * The client may ask to skip the switcher. The standard select_account wins over our own extension
 */
function canSkipAccountSwitcher(prompt: OAuthState['prompt']): boolean {
    return hasPrompt(prompt, PROMPT_SKIP_ACCOUNT_CHOOSE) && !hasPrompt(prompt, PROMPT_ACCOUNT_CHOOSE);
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

        const isSilent = hasPrompt(oauth?.prompt, PROMPT_NONE);

        // Prompt "none" can't be combined with others
        if (isSilent && toArray(oauth?.prompt).length > 1) {
            return this.returnError(context, 'invalid_request');
        }

        if (credentials.isActivationRequired || user.isGuest) {
            if (isSilent) {
                return this.returnError(context, 'login_required');
            }

            context.setState(credentials.isActivationRequired ? new ActivationState() : new LoginState());
        } else if (user.shouldAcceptRules && !user.isDeleted) {
            if (isSilent) {
                return this.returnError(context, 'interaction_required');
            }

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

        const isSilent = hasPrompt(oauth.prompt, PROMPT_NONE);
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
                    // Let's switch user to an account, that is needed for auth
                    return context.run('authenticate', account).then(() => context.setState(new CompleteState()));
                }
            } else if (isSilent) {
                return this.returnError(context, 'login_required');
            }
        }

        // The silent authorization can't choose from multiple accounts without a login_hint
        if (isSwitcherEnabled && isSilent && accounts.available.length > 1) {
            return this.returnError(context, 'account_selection_required');
        }

        // The account switcher is always shown, even for a single account.
        // It's skipped when the account is already known by the login_hint, the user has just logged in,
        // or when the client has asked to skip it with prompt.
        // At this point prompt "none" would be already assert that there is only 1 account
        if (isSwitcherEnabled && !isSilent && !canSkipAccountSwitcher(oauth.prompt)) {
            return context.setState(new ChooseAccountState());
        }

        if (user.isDeleted) {
            if (isSilent) {
                return this.returnError(context, 'interaction_required');
            }

            // you shall not pass
            // if we are here, this means that user have already seen account
            // switcher and now we should redirect him to his profile,
            // because oauth is not available for deleted accounts
            return context.navigate('/');
        }

        // The account is already chosen, but the user must enter the password again, even when the session is still valid
        if (hasPrompt(oauth.prompt, PROMPT_LOGIN) && !oauth.isLoginPassed) {
            const activeAccount = getActiveAccount(context.getState());

            if (!activeAccount) {
                return context.setState(new LoginState());
            }

            context.run('forceLogin', activeAccount.email);

            return context.setState(new PasswordState());
        }

        const data: Record<string, any> = {};

        if (typeof this.isPermissionsAccepted !== 'undefined') {
            data.accept = this.isPermissionsAccepted;
        } else if (oauth.acceptRequired || hasPrompt(oauth.prompt, PROMPT_PERMISSIONS)) {
            if (isSilent) {
                return this.returnError(context, 'consent_required');
            }

            context.setState(new PermissionsState());

            return;
        }

        // TODO: it seems that oAuthComplete may be a separate state
        return context
            .run('oAuthComplete', data)
            .then((resp: { redirectUri?: string }) => {
                // The device code flow has no address to return the user to
                if (!resp.redirectUri) {
                    context.setState(new FinishState());
                } else {
                    return context.run('redirect', resp.redirectUri);
                }
            })
            .catch((error) => {
                if (error instanceof UnauthorizedError) {
                    if (isSilent) {
                        return this.returnError(context, 'login_required');
                    }

                    context.setState(new LoginState());
                } else if (error instanceof OAuthError && error.error === 'accept_required') {
                    if (isSilent) {
                        return this.returnError(context, 'consent_required');
                    }

                    context.setState(new PermissionsState());
                }
            });
    }

    private returnError(context: AuthContext, error: string): Promise<void> {
        // When the user is redirected to the client, the promise never resolves (see the redirect action),
        // so the navigation happens only when there is no address to return the user to
        return context.run('oAuthRedirectError', error).then(() => context.navigate('/'));
    }
}
