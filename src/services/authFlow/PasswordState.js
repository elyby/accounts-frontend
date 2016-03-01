import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ForgotPasswordState from './ForgotPasswordState';

export default class PasswordState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (!user.isGuest) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/password');
        }
    }

    resolve(context, {password}) {
        const {user} = context.getState();

        context.run('login', {
            password,
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
