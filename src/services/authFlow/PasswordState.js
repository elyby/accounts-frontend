// @flow
import logger from 'services/logger';
import { getCredentials } from 'components/auth/reducer';

import AbstractState from './AbstractState';
import ChooseAccountState from './ChooseAccountState';
import CompleteState from './CompleteState';
import ForgotPasswordState from './ForgotPasswordState';
import LoginState from './LoginState';
import MfaState from './MfaState';

import type { AuthContext } from './AuthFlow';

export default class PasswordState extends AbstractState {
    enter(context: AuthContext) {
        const {login} = getCredentials(context.getState());

        if (login) {
            context.navigate('/password');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(
        context: AuthContext,
        {
            password,
            rememberMe
        }: {
            password: string,
            rememberMe: bool
        }
    ) {
        const { login, returnUrl } = getCredentials(context.getState());

        return context.run('login', {
            password,
            rememberMe,
            login
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
            .catch((err = {}) =>
                err.errors || logger.warn('Error logging in', err)
            );
    }

    reject(context: AuthContext) {
        context.setState(new ForgotPasswordState());
    }

    goBack(context: AuthContext) {
        const { isRelogin } = getCredentials(context.getState());

        if (isRelogin) {
            context.setState(new ChooseAccountState());
        } else {
            context.run('setLogin', null);
            context.setState(new LoginState());
        }
    }
}
