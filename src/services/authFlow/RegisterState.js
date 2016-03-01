import AbstractState from './AbstractState';
import CompleteState from './CompleteState';

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
    }
}
