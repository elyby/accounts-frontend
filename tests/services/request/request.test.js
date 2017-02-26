import expect from 'unexpected';
import sinon from 'sinon';

import request from 'services/request';
import { InternalServerError } from 'services/request';

describe('services/request', () => {
    beforeEach(() => {
        sinon.stub(window, 'fetch').named('fetch');
    });

    afterEach(() => {
        window.fetch.restore();
    });

    describe('InternalServerError', () => {
        it('should wrap fetch error', () => {
            const resp = new TypeError('Fetch error');

            fetch.returns(Promise.reject(resp));

            return expect(request.get('/foo'), 'to be rejected')
                .then((error) => {
                    expect(error, 'to be an', InternalServerError);
                    expect(error.originalResponse, 'to be undefined');
                    expect(error.message, 'to equal', resp.message);
                });
        });

        it('should wrap json errors', () => {
            const resp = new Response('bad resp format', {status: 200});

            fetch.returns(Promise.resolve(resp));

            return expect(request.get('/foo'), 'to be rejected')
                .then((error) => {
                    expect(error, 'to be an', InternalServerError);
                    expect(error.originalResponse, 'to be', resp);
                    expect(error.message, 'to contain', 'JSON');
                });
        });

        it('should wrap 5xx errors', () => {
            const resp = new Response('{}', {status: 500});

            fetch.returns(Promise.resolve(resp));

            return expect(request.get('/foo'), 'to be rejected')
                .then((error) => {
                    expect(error, 'to be an', InternalServerError);
                    expect(error.originalResponse, 'to be', resp);
                });
        });
    });
});
