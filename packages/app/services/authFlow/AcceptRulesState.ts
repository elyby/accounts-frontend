import logger from 'app/services/logger';

import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';

export default class AcceptRulesState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { user } = context.getState();

        if (user.shouldAcceptRules) {
            context.navigate('/accept-rules');
        } else {
            context.setState(new CompleteState());
        }
    }

    resolve(context: AuthContext): Promise<void> | void {
        context
            .run('acceptRules')
            .then(() => context.setState(new CompleteState()))
            .catch((err = {}) => err.errors || logger.warn('Error accepting rules', err));
    }

    reject(context: AuthContext): void {
        context.run('logout');
    }
}
