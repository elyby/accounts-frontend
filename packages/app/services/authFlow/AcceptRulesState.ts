import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';

export default class AcceptRulesState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { user } = context.getState();

        if (!user.isDeleted && user.shouldAcceptRules) {
            context.navigate('/accept-rules');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context: AuthContext): Promise<void> | void {
        return context.run('acceptRules').then(() => context.setState(new CompleteState()));
    }

    reject(context: AuthContext, payload: Record<string, any>): void {
        if (payload.deleteAccount) {
            context.navigate('/profile/delete');

            return;
        }

        context.run('logout');
    }
}
