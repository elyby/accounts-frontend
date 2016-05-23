import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ActivationState from './ActivationState';
import RegisterState from './RegisterState';

export default class ResendActivationState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (user.isActive && !user.isGuest) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/resend-activation');
        }
    }

    resolve(context, payload) {
        context.run('resendActivation', payload)
            .then(() => context.setState(new CompleteState()));
    }

    goBack(context) {
        const {user} = context.getState();

        if (user.isGuest) {
            context.setState(new RegisterState());
        } else {
            context.setState(new ActivationState());
        }
    }
}
