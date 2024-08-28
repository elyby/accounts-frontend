import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';

export default class OAuthState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { query, params } = context.getRequest();

        return context
            .run('oAuthValidate', {
                clientId: query.get('client_id') || params.clientId,
                redirectUrl: query.get('redirect_uri')!,
                responseType: query.get('response_type')!,
                description: query.get('description')!,
                scope: (query.get('scope') || '').replace(/,/g, ' '),
                prompt: query.get('prompt')!,
                loginHint: query.get('login_hint')!,
                state: query.get('state')!,
            })
            .then(() => context.setState(new CompleteState()));
    }
}
