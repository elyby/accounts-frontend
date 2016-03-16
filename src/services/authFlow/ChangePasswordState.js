import AbstractState from './AbstractState';
import CompleteState from './CompleteState';

export default class ChangePasswordState extends AbstractState {
    enter(context) {
        context.navigate('/change-password');
    }

    resolve(context, payload) {
        context.run('changePassword', payload)
            .then(() => context.setState(new CompleteState()));
    }

    reject(context) {
        context.run('updateUser', {
            shouldChangePassword: false
        });
        context.setState(new CompleteState());
    }
}
