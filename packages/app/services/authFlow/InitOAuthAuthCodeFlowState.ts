import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';

export default class InitOAuthAuthCodeFlowState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { query, params } = context.getRequest();

        return context
            .run('oAuthValidate', {
                params: {
                    clientId: query.get('client_id') || params.clientId,
                    redirectUrl: query.get('redirect_uri')!,
                    responseType: query.get('response_type')!,
                    scope: (query.get('scope') || '').replace(/,/g, ' '),
                    state: query.get('state')!,
                    code_challenge: query.get('code_challenge') || undefined,
                    code_challenge_method: query.get('code_challenge_method') || undefined,
                },
                description: query.get('description')!,
                prompt: query.get('prompt')!,
                loginHint: query.get('login_hint')!,
            })
            .then(() => context.setState(new CompleteState()));
    }
}
