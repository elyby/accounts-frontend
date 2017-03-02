import logger from 'services/logger';

import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ForgotPasswordState from './ForgotPasswordState';
import LoginState from './LoginState';

export default class PasswordState extends AbstractState {
    enter(context) {
        const {auth} = context.getState();

        if (auth.login) {
            context.navigate('/password');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context, {password, rememberMe}) {
        const {auth: {login}} = context.getState();

        return context.run('login', {
            password,
            rememberMe,
            login
        })
        .then(() => context.setState(new CompleteState()))
        .catch((err = {}) =>
            err.errors || logger.warn('Error logging in', err)
        );
    }

    reject(context) {
        context.setState(new ForgotPasswordState());
    }

    goBack(context) {
        context.run('setLogin', null);
        context.setState(new LoginState());
    }
}
