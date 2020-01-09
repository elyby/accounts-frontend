import AbstractState from './AbstractState';
import CompleteState from './CompleteState';

export default class PermissionsState extends AbstractState {
  enter(context) {
    context.navigate('/oauth/permissions', {
      // replacing oauth entry point if currently on it
      // to allow user easy go-back action to client's site
      replace: context.getRequest().path.includes('oauth2'),
    });
  }

  resolve(context) {
    this.process(context, true);
  }

  reject(context) {
    this.process(context, false);
  }

  process(context, accept) {
    context.setState(
      new CompleteState({
        accept,
      }),
    );
  }
}
