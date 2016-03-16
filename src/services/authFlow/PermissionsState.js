import AbstractState from './AbstractState';
import CompleteState from './CompleteState';

export default class PermissionsState extends AbstractState {
    enter(context) {
        context.navigate('/oauth/permissions');
    }

    resolve(context) {
        this.process(context, true);
    }

    reject(context) {
        this.process(context, false);
    }

    process(context, accept) {
        context.setState(new CompleteState({
            accept
        }));
    }
}
