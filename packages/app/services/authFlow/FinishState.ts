import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';

export default class FinishState extends AbstractState {
  enter(context: AuthContext): Promise<void> | void {
    context.navigate('/oauth/finish');
  }
}
