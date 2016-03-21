import AbstractState from './AbstractState';

export default class FinishState extends AbstractState {
    enter(context) {
        context.navigate('/oauth/finish');
    }
}
