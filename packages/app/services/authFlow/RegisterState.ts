import logger from 'app/services/logger';

import AbstractState from './AbstractState';
import CompleteState from './CompleteState';
import ActivationState from './ActivationState';
import ResendActivationState from './ResendActivationState';

export default class RegisterState extends AbstractState {
  enter(context) {
    context.navigate('/register');
  }

  resolve(context, payload) {
    context
      .run('register', payload)
      .then(() => context.setState(new CompleteState()))
      .catch((err = {}) => err.errors || logger.warn('Error registering', err));
  }

  reject(context, payload) {
    if (payload.requestEmail) {
      context.setState(new ResendActivationState());
    } else {
      context.setState(new ActivationState());
    }
  }
}