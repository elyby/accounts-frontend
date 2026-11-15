import expect from 'app/test/unexpected';
import auth from './reducer';
import { setLogin, clearLogin, setAccountSwitcher, setOAuthLoginPassed, setOAuthRequest, forceLogin } from './actions';

describe('components/auth/reducer', () => {
    describe('auth:setCredentials', () => {
        it('should set login', () => {
            const expectedLogin = 'foo';

            expect(auth(undefined, setLogin(expectedLogin)).credentials, 'to satisfy', {
                login: expectedLogin,
            });
        });

        it('should force login', () => {
            expect(auth(undefined, forceLogin('foo')).credentials, 'to equal', {
                login: 'foo',
                isForcedLogin: true,
            });
        });
    });

    describe('auth:clearCredentials', () => {
        // The state after relogin()
        const state = auth(undefined, {
            type: 'auth:setCredentials',
            payload: { login: 'foo', returnUrl: '/oauth2/v1/ely', isRelogin: true },
        });

        it('should reset the credentials', () => {
            expect(auth(state, clearLogin()).credentials, 'to equal', {});
        });

        it('should reset the credentials, but keep the returnUrl', () => {
            expect(auth(state, clearLogin(true)).credentials, 'to equal', { returnUrl: '/oauth2/v1/ely' });
        });

        it('should reset the credentials completely, when there is no returnUrl to keep', () => {
            expect(auth(auth(undefined, setLogin('foo')), clearLogin(true)).credentials, 'to equal', {});
        });
    });

    describe('set_oauth_login_passed', () => {
        it('should mark the oauth request', () => {
            const state = auth(undefined, setOAuthRequest({ params: { query: {} } }));

            expect(auth(state, setOAuthLoginPassed()).oauth, 'to satisfy', { isLoginPassed: true });
        });

        it('should do nothing without the oauth request', () => {
            expect(auth(undefined, setOAuthLoginPassed()).oauth, 'to be null');
        });
    });

    describe('auth:setAccountSwitcher', () => {
        it('should be enabled by default', () =>
            expect(auth(undefined, {} as any), 'to satisfy', {
                isSwitcherEnabled: true,
            }));

        it('should enable switcher', () => {
            const expectedValue = true;

            expect(auth(undefined, setAccountSwitcher(expectedValue)), 'to satisfy', {
                isSwitcherEnabled: expectedValue,
            });
        });

        it('should disable switcher', () => {
            const expectedValue = false;

            expect(auth(undefined, setAccountSwitcher(expectedValue)), 'to satisfy', {
                isSwitcherEnabled: expectedValue,
            });
        });
    });
});
