import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ActivationState from './ActivationState';
import RegisterState from './RegisterState';

export default class ResendActivationState extends AbstractState {
    enter(context) {
        const {user} = context.getState();

        if (user.isActive) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/resend-activation');
        }
    }

    resolve(context, payload) {
        context.run('resendActivation', payload)
            .then(() => context.setState(new ActivationState()));
    }

    goBack(context) {
        if (context.prevState instanceof RegisterState) {
            context.setState(new RegisterState());
        } else {
            context.setState(new ActivationState());
        }
    }
}
