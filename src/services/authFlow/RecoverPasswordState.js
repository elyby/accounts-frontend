import logger from 'services/logger';

import AbstractState from './AbstractState';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class RecoverPasswordState extends AbstractState {
    enter(context) {
        const {auth} = context.getState();

        if (auth.login) {
            const url = context.getRequest().path.includes('/recover-password')
                ? context.getRequest().path
                : '/recover-password';
            context.navigate(url);
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context, payload) {
        context.run('recoverPassword', payload)
            .then(() => context.setState(new CompleteState()))
            .catch((err = {}) => err.errors || logger.warn(err));
    }

    goBack(context) {
        context.setState(new LoginState());
    }

    reject(context) {
        context.navigate('/send-message');
    }
}
