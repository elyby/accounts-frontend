import expect from 'app/test/unexpected';
import auth from './reducer';
import { setLogin, setAccountSwitcher, setOAuthLoginPassed, setOAuthRequest, forceLogin } from './actions';

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
