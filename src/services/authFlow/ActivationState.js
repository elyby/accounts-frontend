import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ResendActivationState from './ResendActivationState';

export default class ActivationState extends AbstractState {
    enter(context) {
        const {user, routing} = context.getState();

        if (user.isActive) {
            context.setState(new CompleteState());
        } else {
            const url = routing.location.pathname.includes('/activation')
                ? routing.location.pathname
                : '/activation';
            context.navigate(url);
        }
    }

    resolve(context, payload) {
        context.run('activate', payload)
            .then(() => context.setState(new CompleteState()));
    }

    reject(context) {
        context.setState(new ResendActivationState());
    }
}
