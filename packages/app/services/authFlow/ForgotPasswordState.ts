import logger from 'app/services/logger';

import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import LoginState from './LoginState';
import RecoverPasswordState from './RecoverPasswordState';

export default class ForgotPasswordState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        context.navigate('/forgot-password');
    }

    resolve(context: AuthContext, payload: { login: string; captcha: string }): Promise<void> | void {
        context
            .run('forgotPassword', payload)
            .then(() => {
                context.run('setLogin', payload.login);
                context.setState(new RecoverPasswordState());
            })
            .catch((err = {}) => err.errors || logger.warn('Error requesting password recoverage', err));
    }

    goBack(context: AuthContext): void {
        context.setState(new LoginState());
    }

    reject(context: AuthContext): void {
        context.setState(new RecoverPasswordState());
    }
}
