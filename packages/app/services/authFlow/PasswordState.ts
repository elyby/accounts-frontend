import logger from 'app/services/logger';
import { getCredentials } from 'app/components/auth/reducer';
import { getActiveAccount, getAvailableAccounts } from 'app/components/accounts/reducer';

import AbstractState from './AbstractState';
import ChooseAccountState from './ChooseAccountState';
import CompleteState from './CompleteState';
import ForgotPasswordState from './ForgotPasswordState';
import LoginState from './LoginState';
import MfaState from './MfaState';
import { AuthContext } from './AuthFlow';

export default class PasswordState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { login, isTotpRequired } = getCredentials(context.getState());

        if (isTotpRequired) {
            context.setState(new MfaState());
        } else if (login) {
            context.navigate('/password');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(
        context: AuthContext,
        {
            password,
            rememberMe,
        }: {
            password: string;
            rememberMe: boolean;
        },
    ): Promise<void> | void {
        const { login, returnUrl } = getCredentials(context.getState());

        return context
            .run('login', {
                password,
                rememberMe,
                login,
            })
            .then(() => {
                const { isTotpRequired } = getCredentials(context.getState());

                if (isTotpRequired) {
                    return context.setState(new MfaState());
                }

                if (returnUrl) {
                    context.navigate(returnUrl);

                    return;
                }

                return context.setState(new CompleteState());
            })
            .catch((err = {}) => err.errors || logger.warn('Error logging in', err));
    }

    reject(context: AuthContext): void {
        context.setState(new ForgotPasswordState());
    }

    goBack(context: AuthContext): void {
        const state = context.getState();
        const { isRelogin } = getCredentials(state);

        if (isRelogin) {
            const availableAccounts = getAvailableAccounts(state);
            const accountToRemove = getActiveAccount(state);

            if (availableAccounts.length === 1 || !accountToRemove) {
                context.run('logout');
                context.run('setLogin', null);
                context.setState(new LoginState());
            } else {
                const accountToReplace = availableAccounts.find(({ id }) => id !== accountToRemove.id);

                context.run('activateAccount', accountToReplace);
                context.run('removeAccount', accountToRemove);
                context.setState(new ChooseAccountState());
            }
        } else {
            context.run('setLogin', null);
            context.setState(new LoginState());
        }
    }
}
