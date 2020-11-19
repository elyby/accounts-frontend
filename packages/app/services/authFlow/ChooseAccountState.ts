import type { Account } from 'app/components/accounts/reducer';

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

    resolve(context: AuthContext, payload: Account | Record<string, any>): Promise<void> | void {
        if (payload.id) {
            // payload is Account
            return context
                .run('authenticate', payload)
                .then(() => context.run('setAccountSwitcher', false))
                .then(() => context.setState(new CompleteState()));
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
