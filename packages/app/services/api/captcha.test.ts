import expect from 'app/test/unexpected';
import sinon from 'sinon';
// Stub the functions in the module itself: the index re-exports them as getters, which sinon can't replace
import * as request from 'app/services/request/request';

import { getAltchaChallenge } from './captcha';

describe('services/api/captcha', () => {
    afterEach(() => sinon.restore());

    describe('#getAltchaChallenge', () => {
        it('should request the challenge by the url from the captcha params', async () => {
            const challenge = {
                parameters: {
                    algorithm: 'PBKDF2/SHA-256',
                    cost: 10,
                    expiresAt: 4102444800,
                    keyLength: 32,
                    keyPrefix: 'prefix',
                    keySignature: 'keySignature',
                    nonce: 'nonce',
                    salt: 'salt',
                },
                signature: 'signature',
            };
            const get = sinon.stub(request, 'get').resolves({ ...challenge, response: new Response() });

            const resp = await getAltchaChallenge('/api/captcha/altcha/challenge');

            expect(get, 'to have a call satisfying', ['/api/captcha/altcha/challenge']);
            expect(resp, 'to satisfy', { ...challenge, response: expect.it('to be a', Response) });
        });
    });
});
