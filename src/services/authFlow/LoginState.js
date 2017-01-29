import logger from 'services/logger';

import AbstractState from './AbstractState';
import PasswordState from './PasswordState';

export default class LoginState extends AbstractState {
    enter(context) {
        const {auth, user} = context.getState();

        const isUserAddsSecondAccount = !user.isGuest
            && /login|password/.test(context.getRequest().path); // TODO: improve me

        // TODO: it may not allow user to leave password state till he click back or enters password
        if (auth.login) {
            context.setState(new PasswordState());
        } else if (user.isGuest || isUserAddsSecondAccount) {
            context.navigate('/login');
        } else {
            // can not detect needed state. Delegating decision to the next state
            context.setState(new PasswordState());
        }
    }

    resolve(context, payload) {
        context.run('login', payload)
            .then(() => context.setState(new PasswordState()))
            .catch((err = {}) => err.errors || logger.warn(err));
    }

    goBack(context) {
        context.run('goBack', '/');
    }
}
