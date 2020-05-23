import logger from 'app/services/logger';

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
        const { login, password, rememberMe } = getCredentials(context.getState());

        return context
            .run('login', {
                totp,
                password,
                rememberMe,
                login,
            })
            .then(() => context.setState(new CompleteState()))
            .catch((err = {}) => err.errors || logger.warn('Error logging in', err));
    }

    goBack(context: AuthContext) {
        context.setState(new PasswordState());
    }
}
