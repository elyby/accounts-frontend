import FinishState from 'app/services/authFlow/FinishState';
import { SinonMock } from 'sinon';

import { bootstrap, expectNavigate, MockedAuthContext } from './helpers';

describe('FinishState', () => {
    let state: FinishState;
    let context: MockedAuthContext;
    let mock: SinonMock;

    beforeEach(() => {
        state = new FinishState();

        const data = bootstrap();
        context = data.context;
        mock = data.mock;
    });

    afterEach(() => {
        mock.verify();
    });

    describe('#enter', () => {
        it('should navigate to /oauth/finish', () => {
            expectNavigate(mock, '/oauth/finish');

            state.enter(context);
        });
    });
});
