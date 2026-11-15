import type { Account } from 'app/components/accounts/reducer';
import { getCredentials } from 'app/components/auth/reducer';

import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class ChooseAccountState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { auth } = context.getState();

        if (auth.oauth) {
            context.navigate('/oauth/choose-account');
        } else {
            context.navigate('/choose-account');
        }
    }

    // This method might be called with an empty object to mention that user wants to login into a new account.
    // Currently, I can't correctly provide typing since there is no type for an empty object.
    // So if there is no `id` property, it's an empty object
    resolve(context: AuthContext, payload: Account): Promise<void> | void {
        if (payload.id) {
            // The switcher may be shown instead of the relogin, which has interrupted a request (e.g. the oauth one)
            const { returnUrl } = getCredentials(context.getState());

            return context
                .run('authenticate', payload)
                .then(() => context.run('setAccountSwitcher', false))
                .then(() => {
                    if (returnUrl) {
                        context.run('clearLogin');
                        context.navigate(returnUrl);

                        return;
                    }

                    return context.setState(new CompleteState());
                });
        }

        // log in to another account. The interrupted request will be continued after the authentication
        context.navigate('/login');
        context.run('clearLogin', true);
        context.setState(new LoginState());
    }

    reject(context: AuthContext): void {
        context.run('logout');
    }
}
