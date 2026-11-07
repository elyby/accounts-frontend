
import { getCredentials } from 'app/components/auth/reducer';

import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import PasswordState from './PasswordState';
import { AuthContext } from './AuthFlow';

export default class MfaState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { login, password, isTotpRequired } = getCredentials(context.getState());

        if (login && password && isTotpRequired) {
            context.navigate('/mfa');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context: AuthContext, { totp }: { totp: string }): Promise<void> | void {
        const { login, password, rememberMe, returnUrl } = getCredentials(context.getState());

        return context
            .run('login', {
                // @ts-ignore there will be no invalid value
                login,
                password,
                totp,
                rememberMe,
            })
            .then(() => {
                // The user has just logged into the account, so there is nothing to choose
                context.run('setAccountSwitcher', false);

                if (returnUrl) {
                    context.navigate(returnUrl);

                    return;
                }

                return context.setState(new CompleteState());
            });
    }

    goBack(context: AuthContext) {
        context.setState(new PasswordState());
    }
}
