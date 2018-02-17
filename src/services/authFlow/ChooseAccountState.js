import AbstractState from './AbstractState';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class ChooseAccountState extends AbstractState {
    enter(context) {
        const { auth } = context.getState();

        if (auth.oauth) {
            context.navigate('/oauth/choose-account');
        } else {
            context.navigate('/choose-account');
        }
    }

    resolve(context, payload) {
        if (payload.id) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/login');
            context.run('setLogin', null);
            context.setState(new LoginState());
        }
    }

    reject(context) {
        context.run('logout');
    }
}
