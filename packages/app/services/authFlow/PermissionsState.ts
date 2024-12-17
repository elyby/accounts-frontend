import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';

export default class PermissionsState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        context.navigate('/oauth/permissions', {
            // replacing oauth entry point if currently on it
            // to allow user easy go-back action to client's site
            replace: context.getRequest().path.includes('oauth2'),
        });
    }

    resolve(context: AuthContext): Promise<void> | void {
        return this.process(context, true);
    }

    reject(context: AuthContext): void {
        this.process(context, false);
    }

    process(context: AuthContext, accept: boolean): Promise<void> | void {
        return context.setState(
            new CompleteState({
                accept,
            }),
        );
    }
}
