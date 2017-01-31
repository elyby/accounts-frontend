import AbstractState from './AbstractState';
import LoginState from './LoginState';
import CompleteState from './CompleteState';
import RegisterState from './RegisterState';

export default class ChooseAccountState extends AbstractState {
    enter(context) {
        context.navigate('/oauth/choose-account');
    }

    resolve(context, payload) {
        if (payload.id) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/login');
            context.setState(new LoginState());
        }
    }

    /**
     * @param {object} context
     * @param {object} payload
     * @param {bool} [payload.logout=false]
     */
    reject(context, payload = {}) {
        if (payload.logout) {
            context.run('logout');
        } else {
            context.setState(new RegisterState());
        }
    }
}
