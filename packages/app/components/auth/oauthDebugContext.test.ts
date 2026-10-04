import expect from 'app/test/unexpected';

import getOAuthDebugContext from './oauthDebugContext';
import { State as AuthState } from './reducer';

const auth = (state: Partial<AuthState> = {}): { auth: AuthState } => ({
    auth: { oauth: null, client: null, scopes: [], ...state } as AuthState,
});

describe('getOAuthDebugContext', () => {
    it('should return null when there is no validated OAuth request', () => {
        expect(getOAuthDebugContext(auth()), 'to be null');
    });

    it('should describe the auth code request without secrets', () => {
        const result = getOAuthDebugContext(
            auth({
                client: { id: 'tlauncher', name: 'TLauncher', description: '' },
                scopes: ['account_info'],
                oauth: {
                    params: {
                        clientId: 'tlauncher',
                        redirectUrl: 'http://127.0.0.1:57935/?foo=bar',
                        responseType: 'code',
                        scope: 'account_info',
                        state: 'secret-state',
                        code_challenge: 'secret-challenge',
                        code_challenge_method: 'S256',
                    },
                    loginHint: 'user@example.com',
                },
            }),
        );

        expect(result, 'to satisfy', {
            tags: { 'oauth.flow': 'auth_code', 'oauth.client_id': 'tlauncher' },
            context: {
                client_id: 'tlauncher',
                client_name: 'TLauncher',
                redirect_uri: 'http://127.0.0.1:57935/',
                pkce: 'S256',
                has_login_hint: true,
                scopes: ['account_info'],
            },
        });
        expect(JSON.stringify(result), 'not to contain', 'secret-state', 'secret-challenge', 'user@example.com', 'foo=bar');
    });

    it('should describe the device code request without the user code', () => {
        const result = getOAuthDebugContext(
            auth({
                client: { id: 'ely', name: 'Ely.by', description: '' },
                oauth: { params: { userCode: 'SECRETCODE' } },
            }),
        );

        expect(result, 'to satisfy', {
            tags: { 'oauth.flow': 'device_code', 'oauth.client_id': 'ely' },
            context: { client_id: 'ely', client_name: 'Ely.by' },
        });
        expect(JSON.stringify(result), 'not to contain', 'SECRETCODE');
    });
});
