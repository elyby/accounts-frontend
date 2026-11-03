import { Scope } from 'app/services/api/oauth';

/**
 * The scopes, which don't grant access to any data and so aren't shown to the user
 */
const HIDDEN_SCOPES: ReadonlyArray<Scope> = [
    'openid',
];

/**
 * The OpenID Connect scopes, which grant the same permissions as our own scopes,
 * so they're shown with the same descriptions
 */
const SCOPE_ALIASES: Readonly<Record<Scope, Scope>> = {
    profile: 'account_info',
    email: 'account_email',
};

/**
 * Prepares the scopes received from the backend to be shown on the permissions screen
 */
export default function getDisplayScopes(scopes: ReadonlyArray<Scope>): Array<Scope> {
    return scopes.filter((scope) => !HIDDEN_SCOPES.includes(scope)).map((scope) => SCOPE_ALIASES[scope] ?? scope);
}
