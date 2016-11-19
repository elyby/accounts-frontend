import AbstractState from './AbstractState';
import CompleteState from './CompleteState';

export default class OAuthState extends AbstractState {
    enter(context) {
        const {query, params} = context.getRequest();

        return context.run('oAuthValidate', {
            clientId: query.client_id || params.clientId,
            redirectUrl: query.redirect_uri,
            responseType: query.response_type,
            description: query.description,
            scope: query.scope,
            prompt: query.prompt,
            loginHint: query.login_hint,
            state: query.state
        }).then(() => context.setState(new CompleteState()));
    }
}
