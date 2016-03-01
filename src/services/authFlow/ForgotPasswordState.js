import AbstractState from './AbstractState';
import LoginState from './LoginState';

export default class ForgotPasswordState extends AbstractState {
    enter(context) {
        context.navigate('/forgot-password');
    }

    goBack(context) {
        context.setState(new LoginState());
    }

    reject(context) {
        context.navigate('/send-message');
    }
}
