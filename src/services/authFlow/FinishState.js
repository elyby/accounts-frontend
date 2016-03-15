import AbstractState from './AbstractState';

export default class CompleteState extends AbstractState {
    enter(context) {
        context.navigate('/oauth/finish');
    }
}
