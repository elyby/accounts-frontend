import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ActivationState from './ActivationState';
import ResendActivationState from './ResendActivationState';

export default class RegisterState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (user.isGuest) {
            context.navigate('/register');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context, payload) {
        context.run('register', payload)
            .then(() => context.setState(new CompleteState()));
    }

    reject(context, payload) {
        if (payload.requestEmail) {
            context.setState(new ResendActivationState());
        } else {
            context.setState(new ActivationState());
        }
    }
}
