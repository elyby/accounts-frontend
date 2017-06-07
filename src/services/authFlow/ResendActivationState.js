// @flow
import logger from 'services/logger';

import AbstractState from './AbstractState';
import ActivationState from './ActivationState';
import RegisterState from './RegisterState';
import type { AuthContext } from 'services/authFlow';

export default class ResendActivationState extends AbstractState {
    enter(context: AuthContext) {
        context.navigate('/resend-activation');
    }

    resolve(context: AuthContext, payload: Object) {
        context.run('resendActivation', payload)
            .then(() => context.setState(new ActivationState()))
            .catch((err = {}) =>
                err.errors || logger.warn('Error resending activation', err)
            );
    }

    reject(context: AuthContext) {
        context.setState(new ActivationState());
    }

    goBack(context: AuthContext) {
        if (context.prevState instanceof RegisterState) {
            context.setState(new RegisterState());
        } else {
            context.setState(new ActivationState());
        }
    }
}
