import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
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

    reject(context) {
        context.setState(new ResendActivationState());
    }
}
