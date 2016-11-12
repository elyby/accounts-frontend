import AbstractState from './AbstractState';
import PasswordState from './PasswordState';

export default class LoginState extends AbstractState {
    enter(context) {
        const {auth, user} = context.getState();

        // TODO: it may not allow user to leave password state till he click back or enters password
        if (auth.login) {
            context.setState(new PasswordState());
        } else if (user.isGuest
            // for the case, when user is logged in and wants to add a new aacount
            || /login|password/.test(context.getRequest().path) // TODO: improve me
        ) {
            context.navigate('/login');
        }
    }

    resolve(context, payload) {
        context.run('login', payload)
            .then(() => context.setState(new PasswordState()));
    }
}
