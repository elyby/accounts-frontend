import AbstractState from './AbstractState';
import CompleteState from './CompleteState';

export default class ChangePasswordState extends AbstractState {
    enter(context) {
        context.navigate('/change-password');
    }

    reject(context) {
        context.run('updateUser', {
            shouldChangePassword: false
        });
        context.setState(new CompleteState());
    }
}
