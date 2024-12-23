import { AuthContext } from 'app/services/authFlow';

import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ResendActivationState from './ResendActivationState';

export default class ActivationState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const url = context.getRequest().path.includes('/activation') ? context.getRequest().path : '/activation';
        context.navigate(url);
    }

    resolve(context: AuthContext, payload: { key: string }): Promise<void> | void {
        return context.run('activate', payload.key).then(() => context.setState(new CompleteState()));
    }

    reject(context: AuthContext): void {
        context.setState(new ResendActivationState());
    }
}
