import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ResendActivationState from './ResendActivationState';

export default class RegisterState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (!user.isGuest) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/register');
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
