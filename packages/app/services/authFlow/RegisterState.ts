import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';
import ActivationState from './ActivationState';
import ResendActivationState from './ResendActivationState';

export default class RegisterState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        context.navigate('/register');
    }

    resolve(
        context: AuthContext,
        payload: {
            email: string;
            username: string;
            password: string;
            rePassword: string;
            captcha: string;
            rulesAgreement: boolean;
        },
    ): Promise<void> | void {
        return context.run('register', payload).then(() => context.setState(new CompleteState()));
    }

    reject(context: AuthContext, payload: Record<string, any>): void {
        if (payload.requestEmail) {
            context.setState(new ResendActivationState());
        } else {
            context.setState(new ActivationState());
        }
    }
}
