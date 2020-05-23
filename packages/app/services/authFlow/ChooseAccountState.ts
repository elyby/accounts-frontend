import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class ChooseAccountState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { auth } = context.getState();

        if (auth.oauth) {
            context.navigate('/oauth/choose-account');
        } else {
            context.navigate('/choose-account');
        }
    }

    resolve(context: AuthContext, payload: Record<string, any>): Promise<void> | void {
        if (payload.id) {
            context.setState(new CompleteState());
        } else {
            context.navigate('/login');
            context.run('setLogin', null);
            context.setState(new LoginState());
        }
    }

    reject(context: AuthContext): void {
        context.run('logout');
    }
}
