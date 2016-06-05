import AbstractState from './AbstractState';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class RecoverPasswordState extends AbstractState {
    enter(context) {
        const {user, routing} = context.getState();

        if (user.isGuest) {
            const url = routing.location.pathname.includes('/recover-password')
                ? routing.location.pathname
                : '/recover-password';
            context.navigate(url);
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context, payload) {
        context.run('recoverPassword', payload)
            .then(() => context.setState(new CompleteState()));
    }

    goBack(context) {
        context.setState(new LoginState());
    }

    reject(context) {
        context.navigate('/send-message');
    }
}
