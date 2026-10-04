import { State as RootState } from 'app/types';

/**
 * Describes the current OAuth request for the error reports.
 * Secrets (state, user_code, code_challenge) and personal data (login_hint) are deliberately omitted.
 *
 * Returns null when there is no validated OAuth request. Before the validation completes (or when it fails)
 * all the request's parameters are available in the event's URL anyway
 */
export default function getOAuthDebugContext({
    auth,
}: Pick<RootState, 'auth'>): { context: Record<string, unknown>; tags: Record<string, string> } | null {
    const { oauth, client, scopes } = auth;

    if (!oauth) {
        return null;
    }

    const { params } = oauth;

    if ('userCode' in params) {
        return build({
            flow: 'device_code',
            client_id: client?.id,
            client_name: client?.name,
            prompt: oauth.prompt,
            scopes,
            accept_required: oauth.acceptRequired,
            success: oauth.success,
        });
    }

    return build({
        flow: 'auth_code',
        client_id: params.clientId,
        client_name: client?.name,
        redirect_uri: stripQuery(params.redirectUrl),
        response_type: params.responseType,
        requested_scope: params.scope,
        pkce: params.code_challenge ? params.code_challenge_method || 'plain' : 'none',
        prompt: oauth.prompt,
        has_login_hint: Boolean(oauth.loginHint),
        scopes,
        accept_required: oauth.acceptRequired,
        success: oauth.success,
    });
}

function build(context: Record<string, unknown>): { context: Record<string, unknown>; tags: Record<string, string> } {
    const tags: Record<string, string> = {
        'oauth.flow': context.flow as string,
    };

    if (typeof context.client_id === 'string') {
        tags['oauth.client_id'] = context.client_id;
    }

    return { context, tags };
}

/**
 * The query may contain arbitrary client's data, so keep only the target
 */
function stripQuery(url: string | undefined): string | undefined {
    return url ? url.split('?')[0] : undefined;
}
