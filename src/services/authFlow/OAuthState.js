import AbstractState from './AbstractState';
import CompleteState from './CompleteState';

export default class OAuthState extends AbstractState {
    enter(context) {
        const {query, params} = context.getRequest();

        return context.run('oAuthValidate', {
            clientId: query.client_id || params.clientId,
            redirectUrl: query.redirect_uri,
            responseType: query.response_type,
            scope: query.scope,
            state: query.state
        }).then(() => context.setState(new CompleteState()));
    }
}
