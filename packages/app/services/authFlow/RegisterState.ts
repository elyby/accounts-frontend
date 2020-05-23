import logger from 'app/services/logger';

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
    payload: Record<string, any>,
  ): Promise<void> | void {
    context
      .run('register', payload)
      .then(() => context.setState(new CompleteState()))
      .catch((err = {}) => err.errors || logger.warn('Error registering', err));
  }

  reject(context: AuthContext, payload: Record<string, any>): void {
    if (payload.requestEmail) {
      context.setState(new ResendActivationState());
    } else {
      context.setState(new ActivationState());
    }
  }
}
