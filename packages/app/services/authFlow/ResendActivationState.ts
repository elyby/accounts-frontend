import { AuthContext } from 'app/services/authFlow';

import AbstractState from './AbstractState';
import ActivationState from './ActivationState';
import RegisterState from './RegisterState';

export default class ResendActivationState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        context.navigate('/resend-activation');
    }

    resolve(context: AuthContext, payload: { email: string; captcha: string }): Promise<void> | void {
        return context.run('resendActivation', payload).then(() => context.setState(new ActivationState()));
    }

    reject(context: AuthContext): void {
        context.setState(new ActivationState());
    }

    goBack(context: AuthContext): void {
        if (context.prevState instanceof RegisterState) {
            context.setState(new RegisterState());
        } else {
            context.setState(new ActivationState());
        }
    }
}
