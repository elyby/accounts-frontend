import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';

export default class InitOAuthAuthCodeFlowState extends AbstractState {
    enter(context: AuthContext): Promise<void> | void {
        const { query, params } = context.getRequest();

        const oauthQuery = Object.fromEntries(query);
        const clientId = query.get('client_id') ?? params.clientId;

        if (clientId !== undefined) {
            oauthQuery.client_id = clientId;
        }

        if (oauthQuery.scope !== undefined) {
            // The backend splits the scopes only by spaces, but the legacy clients pass them comma separated
            oauthQuery.scope = oauthQuery.scope.replace(/,/g, ' ');
        }

        return context
            .run('oAuthValidate', {
                params: {
                    query: oauthQuery,
                },
                description: query.get('description')!,
                prompt: query.get('prompt')!,
                loginHint: query.get('login_hint')!,
            })
            .then(() => context.setState(new CompleteState()));
    }
}
