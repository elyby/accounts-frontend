import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ActivationState from './ActivationState';

export default class ResendActivationState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (user.isActive) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/repeat-message');
        }
    }

    resolve(context, payload) {
        context.run('resendActivation', payload)
            .then(() => context.setState(new CompleteState()));
    }

    goBack(context) {
        context.setState(new ActivationState());
    }
}
