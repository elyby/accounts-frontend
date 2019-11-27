import logger from 'services/logger';

import AbstractState from './AbstractState';
import CompleteState from './CompleteState';

export default class AcceptRulesState extends AbstractState {
  enter(context) {
    const { user } = context.getState();

    if (user.shouldAcceptRules) {
      context.navigate('/accept-rules');
    } else {
      context.setState(new CompleteState());
    }
  }

  resolve(context) {
    context
      .run('acceptRules')
      .then(() => context.setState(new CompleteState()))
      .catch(
        (err = {}) => err.errors || logger.warn('Error accepting rules', err),
      );
  }

  reject(context) {
    context.run('logout');
  }
}
