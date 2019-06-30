import expect from 'test/unexpected';

import auth from 'components/auth/reducer';
import {
    setLogin, SET_CREDENTIALS,
    setAccountSwitcher, SET_SWITCHER
} from 'components/auth/actions';

describe('components/auth/reducer', () => {
    describe(SET_CREDENTIALS, () => {
        it('should set login', () => {
            const expectedLogin = 'foo';

            expect(auth(undefined, setLogin(expectedLogin)).credentials, 'to satisfy', {
                login: expectedLogin
            });
        });
    });

    describe(SET_SWITCHER, () => {
        it('should be enabled by default', () =>
            expect(auth(undefined, {}), 'to satisfy', {
                isSwitcherEnabled: true
            })
        );

        it('should enable switcher', () => {
            const expectedValue = true;

            expect(auth(undefined, setAccountSwitcher(expectedValue)), 'to satisfy', {
                isSwitcherEnabled: expectedValue
            });
        });

        it('should disable switcher', () => {
            const expectedValue = false;

            expect(auth(undefined, setAccountSwitcher(expectedValue)), 'to satisfy', {
                isSwitcherEnabled: expectedValue
            });
        });
    });
});
