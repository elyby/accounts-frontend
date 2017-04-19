import logger from 'services/logger';

import AbstractState from './AbstractState';
import LoginState from './LoginState';
import RecoverPasswordState from './RecoverPasswordState';

export default class ForgotPasswordState extends AbstractState {
    enter(context) {
        context.navigate('/forgot-password');
    }

    resolve(context, payload = {}) {
        const login = payload.email || this.getLogin(context);

        context.run('forgotPassword', {login})
            .then(() => {
                context.run('setLogin', login);
                context.setState(new RecoverPasswordState());
            })
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
