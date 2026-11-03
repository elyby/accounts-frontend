import { State as RootState } from 'app/types';

/**
 * The authorization request's params, which are secrets (state, code_challenge, nonce, request objects)
 * or personal data (login_hint)
 */
const OMITTED_QUERY_PARAMS: ReadonlyArray<string> = [
    'state',
    'code_challenge',
    'nonce',
    'request',
    'request_uri',
    'login_hint',
];

/**
 * Describes the current OAuth request for the error reports.
 * All the authorization request's params are included, except the secrets and personal data
 * (see OMITTED_QUERY_PARAMS and user_code).
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

    const { query } = params;

    return build({
        ...Object.fromEntries(Object.entries(query).filter(([key]) => !OMITTED_QUERY_PARAMS.includes(key))),
        flow: 'auth_code',
        client_name: client?.name,
        redirect_uri: stripQuery(query.redirect_uri),
        pkce: query.code_challenge === undefined ? 'none' : (query.code_challenge_method ?? 'missing'),
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
