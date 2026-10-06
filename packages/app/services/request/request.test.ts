import expect from 'app/test/unexpected';
import sinon, { SinonStub } from 'sinon';

import * as request from 'app/services/request';
import { ApiError, InternalServerError, RequestAbortedError } from 'app/services/request';

const jsonResponse = (body: any, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('services/request', () => {
    let fetch: SinonStub;

    beforeEach(() => {
        fetch = sinon.stub(globalThis, 'fetch').named('fetch');
    });

    afterEach(() => {
        fetch.restore();
    });

    const lastRequest = (): Request => fetch.lastCall.args[0];

    describe('requests', () => {
        it('should send GET data as query string', async () => {
            fetch.resolves(jsonResponse({ foo: 'bar' }));

            const resp = await request.get<{ foo: string }>('/api/foo', { foo: 1, bar: true });

            expect(resp.foo, 'to be', 'bar');
            expect(resp.originalResponse, 'to be a', Response);
            expect(lastRequest().method, 'to be', 'GET');
            expect(new URL(lastRequest().url).search, 'to be', '?foo=1&bar=1');
            expect(lastRequest().headers.get('Accept'), 'to be', 'application/json');
            expect(lastRequest().headers.has('Content-Type'), 'to be false');
        });

        it('should send searchParams with POST', async () => {
            fetch.resolves(jsonResponse({ success: true }));

            await request.post('/api/foo', { foo: 'bar' }, { searchParams: { scope: 'a b', bar: true, baz: undefined } });

            expect(new URL(lastRequest().url).search, 'to be', '?scope=a+b&bar=1&baz=');
        });

        it('should merge GET data with the query string of the url', async () => {
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo?client_id=ely', { scope: 'a b', bar: false, baz: null, qux: undefined });

            expect(new URL(lastRequest().url).search, 'to be', '?client_id=ely&scope=a+b&bar=0&baz=&qux=');
        });

        [
            ['post', request.post],
            ['put', request.put],
            ['delete', request.del],
        ].forEach(([method, send]: any) =>
            it(`should send ${method.toUpperCase()} data as form urlencoded body`, async () => {
                let body: string | undefined;
                fetch.callsFake(async (req: Request) => {
                    body = await req.text();

                    return jsonResponse({ success: true });
                });

                await send('/api/foo', { foo: 'b c', bar: false });

                expect(lastRequest().method, 'to be', method.toUpperCase());
                expect(lastRequest().headers.get('Content-Type'), 'to contain', 'application/x-www-form-urlencoded');
                expect(body, 'to be', 'foo=b+c&bar=0');
            }),
        );
    });

    describe('ApiError', () => {
        it('should reject with response body fields on 4xx', async () => {
            fetch.resolves(jsonResponse({ success: false, errors: { login: 'error.login_required' } }, 400));

            const error = await request.post('/api/foo').catch((err) => err);

            expect(error, 'to be an', ApiError);
            expect(error, 'to be an', Error);
            expect(error.errors, 'to satisfy', { login: 'error.login_required' });
            expect(error.originalResponse.status, 'to be', 400);
        });

        it('should reject when success is false with 200 status', async () => {
            fetch.resolves(jsonResponse({ success: false, errors: { key: 'error.key_expire' } }));

            const error = await request.post('/api/foo').catch((err) => err);

            expect(error, 'to be an', ApiError);
            expect(error.errors.key, 'to be', 'error.key_expire');
        });

        it('should expose name, message and status from the body', async () => {
            fetch.resolves(jsonResponse({ name: 'Unauthorized', message: 'Token expired', status: 401 }, 401));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to satisfy', { name: 'Unauthorized', message: 'Token expired', status: 401 });
        });
    });

    describe('InternalServerError', () => {
        it('should wrap json errors', async () => {
            fetch.resolves(new Response('bad resp format', { status: 200 }));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', InternalServerError);
            expect(error.originalResponse, 'to be a', Response);
            expect(error.message, 'to contain', 'Unexpected token');
        });

        [null, 'foo', 42, true].forEach((body) =>
            it(`should wrap primitive json body ${JSON.stringify(body)}`, async () => {
                fetch.resolves(jsonResponse(body));

                const error = await request.get('/api/foo').catch((err) => err);

                expect(error, 'to be an', InternalServerError);
                expect(error.message, 'to be', 'Unexpected response body');
                expect(error.originalResponse.status, 'to be', 200);
            }),
        );

        it('should wrap 5xx errors', async () => {
            fetch.resolves(jsonResponse({}, 500));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', InternalServerError);
            expect(error.originalResponse.status, 'to be', 500);
        });

        it('should keep the original response body readable', async () => {
            fetch.resolves(jsonResponse({ foo: 'bar' }, 500));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(await error.originalResponse.text(), 'to be', '{"foo":"bar"}');
        });
    });

    describe('RequestAbortedError', () => {
        it('should wrap aborted errors', async () => {
            fetch.resolves(Response.error());

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', RequestAbortedError);
        });

        it('should wrap "Failed to fetch" errors', async () => {
            fetch.rejects(new TypeError('Failed to fetch'));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', RequestAbortedError);
            // The logger filters network errors by this message
            expect(error.message, 'to be', 'Failed to fetch');
        });
    });

    describe('#addErrorListener', () => {
        it('should notify about errors', async () => {
            const listener = sinon.spy();
            request.addErrorListener(listener);

            fetch.resolves(jsonResponse({}, 500));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(listener, 'to have a call satisfying', [error]);
        });
    });

});
