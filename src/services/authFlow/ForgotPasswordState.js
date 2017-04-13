import logger from 'services/logger';

import AbstractState from './AbstractState';
import LoginState from './LoginState';
import CompleteState from './CompleteState';
import RecoverPasswordState from './RecoverPasswordState';

export default class ForgotPasswordState extends AbstractState {
    enter(context) {
        if (this.getLogin(context)) {
            context.navigate('/forgot-password');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context, payload = {}) {
        context.run('forgotPassword', {login: payload.email || this.getLogin(context)})
            .then(() => context.setState(new RecoverPasswordState()))
            .catch((err = {}) =>
                err.errors || logger.warn('Error requesting password recoverage', err)
            );
    }

    goBack(context) {
        context.setState(new LoginState());
    }

    reject(context) {
        context.setState(new RecoverPasswordState());
    }

    getLogin(context) {
        const {auth} = context.getState();

        return auth.login;
    }
}
