import logger from 'app/services/logger';

import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class RecoverPasswordState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const url = context.getRequest().path.includes('/recover-password')
            ? context.getRequest().path
            : '/recover-password';
        context.navigate(url);
    }

    resolve(context: AuthContext, payload: Record<string, any>): Promise<void> | void {
        context
            .run('recoverPassword', payload)
            .then(() => context.setState(new CompleteState()))
            .catch((err = {}) => err.errors || logger.warn('Error recovering password', err));
    }

    goBack(context: AuthContext): void {
        context.setState(new LoginState());
    }

    reject(context: AuthContext): void {
        context.run('contactUs');
    }
}
