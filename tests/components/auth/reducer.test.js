import expect from 'unexpected';

import auth from 'components/auth/reducer';
import { setLogin, SET_LOGIN } from 'components/auth/actions';

describe('auth reducer', () => {
    describe(SET_LOGIN, () => {
        it('should set login', () => {
            const expectedLogin = 'foo';

            expect(auth(undefined, setLogin(expectedLogin)), 'to satisfy', {
                login: expectedLogin
            });
        });
    });
});
