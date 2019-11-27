import logger from 'services/logger';

import AbstractState from './AbstractState';
import LoginState from './LoginState';
import CompleteState from './CompleteState';

export default class RecoverPasswordState extends AbstractState {
  enter(context) {
    const url = context.getRequest().path.includes('/recover-password')
      ? context.getRequest().path
      : '/recover-password';
    context.navigate(url);
  }

  resolve(context, payload) {
    context
      .run('recoverPassword', payload)
      .then(() => context.setState(new CompleteState()))
      .catch(
        (err = {}) =>
          err.errors || logger.warn('Error recovering password', err),
      );
  }

  goBack(context) {
    context.setState(new LoginState());
  }

  reject(context) {
    context.run('contactUs');
  }
}
