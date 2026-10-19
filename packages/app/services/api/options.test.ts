import expect from 'app/test/unexpected';
import sinon from 'sinon';
// Stub the functions in the module itself: the index re-exports them as getters, which sinon can't replace
import * as request from 'app/services/request/request';
import * as options from './options';

describe('services/api/options', () => {
    const expectedResp = {
        foo: 'bar',
    };

    beforeEach(() => {
        sinon
            .stub(request, 'get')
            .named('request.get')
            .returns(
                Promise.resolve({
                    response: new Response(),
                    ...expectedResp,
                }),
            );
    });

    afterEach(() => {
        (request.get as any).restore();
    });

    it('should request options without token', () =>
        options.fetch().then((resp) => {
            expect(resp, 'to satisfy', {
                ...expectedResp,
                response: expect.it('to be a', Response),
            });
            expect(request.get, 'to have a call satisfying', ['/api/options', {}, { token: null }]);
        }));

    it('should cache options', () =>
        // NOTE: this is bad practice, but we are relying on the state from
        // the previous test
        options.fetch().then((resp) => {
            expect(resp, 'to satisfy', {
                ...expectedResp,
                response: expect.it('to be a', Response),
            });
            expect(request.get, 'was not called');
        }));
});
