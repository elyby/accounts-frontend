// @flow
import logger from 'services/logger';

import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ResendActivationState from './ResendActivationState';
import type { AuthContext } from 'services/authFlow';

export default class ActivationState extends AbstractState {
    enter(context: AuthContext) {
        const url = context.getRequest().path.includes('/activation')
            ? context.getRequest().path
            : '/activation';
        context.navigate(url);
    }

    resolve(context: AuthContext, payload: Object) {
        context.run('activate', payload)
            .then(() => context.setState(new CompleteState()))
            .catch((err = {}) =>
                err.errors || logger.warn('Error activating account', err)
            );
    }

    reject(context: AuthContext) {
        context.setState(new ResendActivationState());
    }
}
