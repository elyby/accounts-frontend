import type { Account } from 'app/components/accounts/reducer';
import logger from 'app/services/logger';

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
            return (
                context
                    .run('authenticate', payload)
                    .then(() => context.run('setAccountSwitcher', false))
                    .then(() => context.setState(new CompleteState()))
                    // By default, this error must cause a BSOD. But by I don't know why reasons it shouldn't,
                    // because somebody somewhere catches an invalid authentication result and routes the user
                    // to the password entering form. To keep this behavior we catch all errors, log it and suppress
                    .catch((err) => err.errors || logger.warn('Error choosing an account', err))
            );
        }

        // log in to another account
        context.navigate('/login');
        context.run('setLogin', null);
        context.setState(new LoginState());
    }

    reject(context: AuthContext): void {
        context.run('logout');
    }
}
