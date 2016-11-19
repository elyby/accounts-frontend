import AbstractState from './AbstractState';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class ChooseAccountState extends AbstractState {
    enter(context) {
        context.navigate('/oauth/choose-account');
    }

    resolve(context, payload) {
        // do not ask again after user adds account, or chooses an existed one
        context.run('setAccountSwitcher', false);

        if (payload.id) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/login');
            context.setState(new LoginState());
        }
    }

    reject(context) {
        context.run('logout');
    }
}
