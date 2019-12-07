import logger from 'services/logger';

import AbstractState from './AbstractState';
import LoginState from './LoginState';
import RecoverPasswordState from './RecoverPasswordState';

export default class ForgotPasswordState extends AbstractState {
  enter(context) {
    context.navigate('/forgot-password');
  }

  resolve(
    context,
    payload: {
      login?: string;
    } = {},
  ) {
    context
      .run('forgotPassword', payload)
      .then(() => {
        context.run('setLogin', payload.login);
        context.setState(new RecoverPasswordState());
      })
      .catch(
        (err = {}) =>
          err.errors ||
          logger.warn('Error requesting password recoverage', err),
      );
  }

  goBack(context) {
    context.setState(new LoginState());
  }

  reject(context) {
    context.setState(new RecoverPasswordState());
  }
}
