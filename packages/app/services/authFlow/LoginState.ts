import logger from 'app/services/logger';
import { getLogin } from 'app/components/auth/reducer';

import AbstractState from './AbstractState';
import PasswordState from './PasswordState';
import RegisterState from './RegisterState';
import { AuthContext } from './AuthFlow';

export default class LoginState extends AbstractState {
  enter(context: AuthContext) {
    const login = getLogin(context.getState());
    const { user } = context.getState();

    const isUserAddsSecondAccount =
      !user.isGuest && /login|password/.test(context.getRequest().path); // TODO: improve me

    // TODO: it may not allow user to leave password state till he click back or enters password
    if (login) {
      context.setState(new PasswordState());
    } else if (user.isGuest || isUserAddsSecondAccount) {
      context.navigate('/login');
    } else {
      // can not detect needed state. Delegating decision to the next state
      context.setState(new PasswordState());
    }
  }

  resolve(
    context: AuthContext,
    payload: {
      login: string;
    },
  ) {
    context
      .run('login', payload)
      .then(() => context.setState(new PasswordState()))
      .catch(
        (err = {}) => err.errors || logger.warn('Error validating login', err),
      );
  }

  reject(context: AuthContext) {
    context.setState(new RegisterState());
  }

  goBack(context: AuthContext) {
    context.run('goBack', {
      fallbackUrl: '/',
    });
  }
}
