import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ForgotPasswordState from './ForgotPasswordState';
import LoginState from './LoginState';

export default class PasswordState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (user.isGuest) {
            context.navigate('/password');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context, {password, rememberMe}) {
        const {user} = context.getState();

        context.run('login', {
            password,
            rememberMe,
            login: user.email || user.username
        })
        .then(() => context.setState(new CompleteState()));
    }

    reject(context) {
        context.setState(new ForgotPasswordState());
    }

    goBack(context) {
        context.run('logout');
        context.setState(new LoginState());
    }
}
