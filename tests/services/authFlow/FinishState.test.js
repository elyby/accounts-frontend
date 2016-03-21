import FinishState from 'services/authFlow/FinishState';

import { bootstrap, expectNavigate } from './helpers';

describe('FinishState', () => {
    let state;
    let context;
    let mock;

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
