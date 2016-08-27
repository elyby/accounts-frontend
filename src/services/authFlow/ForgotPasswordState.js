import AbstractState from './AbstractState';
import LoginState from './LoginState';
import CompleteState from './CompleteState';
import RecoverPasswordState from './RecoverPasswordState';

export default class ForgotPasswordState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (user.isGuest) {
            if (this.getLogin(context)) {
                context.navigate('/forgot-password');
            } else {
                context.setState(new LoginState());
            }
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context, payload = {}) {
        context.run('forgotPassword', {login: payload.email || this.getLogin(context)})
            .then(() => context.setState(new RecoverPasswordState()));
    }

    goBack(context) {
        context.setState(new LoginState());
    }

    reject(context) {
        context.setState(new RecoverPasswordState());
    }

    getLogin(context) {
        const {user} = context.getState();

        return user.email || user.username;
    }
}
