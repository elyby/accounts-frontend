import expect from 'app/test/unexpected';

import getDisplayScopes from './getDisplayScopes';

describe('getDisplayScopes', () => {
    it('should keep our own scopes as is', () => {
        expect(getDisplayScopes(['minecraft_server_session', 'offline_access', 'account_info', 'account_email']), 'to equal', [
            'minecraft_server_session',
            'offline_access',
            'account_info',
            'account_email',
        ]);
    });

    it('should hide the openid scope', () => {
        expect(getDisplayScopes(['openid', 'account_info']), 'to equal', ['account_info']);
    });

    it('should return an empty list when only the openid scope is requested', () => {
        expect(getDisplayScopes(['openid']), 'to equal', []);
    });

    it('should show the OpenID Connect scopes as our own aliased scopes', () => {
        expect(getDisplayScopes(['openid', 'profile', 'email']), 'to equal', ['account_info', 'account_email']);
    });

    it('should keep the unknown scopes', () => {
        expect(getDisplayScopes(['change_skin']), 'to equal', ['change_skin']);
    });
});
