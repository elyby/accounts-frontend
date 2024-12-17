import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class RecoverPasswordState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const url = context.getRequest().path.includes('/recover-password')
            ? context.getRequest().path
            : '/recover-password';
        context.navigate(url);
    }

    resolve(
        context: AuthContext,
        payload: { key: string; newPassword: string; newRePassword: string },
    ): Promise<void> | void {
        return context.run('recoverPassword', payload).then(() => context.setState(new CompleteState()));
    }

    goBack(context: AuthContext): void {
        context.setState(new LoginState());
    }

    reject(context: AuthContext): void {
        context.run('contactUs');
    }
}
