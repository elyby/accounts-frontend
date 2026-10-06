import expect from 'app/test/unexpected';
import sinon, { SinonStub } from 'sinon';

import * as request from 'app/services/request';
import {
    ApiError,
    InternalServerError,
    OAuthError,
    RequestAbortedError,
    RequestError,
    UnauthorizedError,
    ValidationError,
} from 'app/services/request';

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
            expect(resp.response, 'to be a', Response);
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
        it('should reject with ValidationError on { success: false, errors }', async () => {
            fetch.resolves(jsonResponse({ success: false, errors: { login: 'error.login_required' } }, 400));

            const error = await request.post('/api/foo').catch((err) => err);

            expect(error, 'to be a', ValidationError);
            expect(error, 'to be an', ApiError);
            expect(error, 'to be a', RequestError);
            expect(error, 'to be an', Error);
            expect(error, 'to satisfy', {
                name: 'ValidationError',
                message: 'Validation failed: error.login_required',
                errors: { login: 'error.login_required' },
                data: {},
                status: 400,
            });
            expect(error.response, 'to be a', Response);
        });

        it('should reject with ValidationError when success is false with 200 status', async () => {
            fetch.resolves(
                jsonResponse({ success: false, errors: { key: 'error.key_expire' }, data: { canRepeatIn: 60 } }),
            );

            const error = await request.post('/api/foo').catch((err) => err);

            expect(error, 'to be a', ValidationError);
            expect(error, 'to satisfy', { errors: { key: 'error.key_expire' }, data: { canRepeatIn: 60 }, status: 200 });
        });

        it('should normalize empty data, serialized by PHP as an array', async () => {
            fetch.resolves(jsonResponse({ success: false, errors: { key: 'error.key_expire' }, data: [] }));

            const error = await request.post('/api/foo').catch((err) => err);

            expect(error.data, 'to equal', {});
        });

        it('should reject with ApiError when success is false without errors', async () => {
            fetch.resolves(jsonResponse({ success: false }));

            const error = await request.post('/api/foo').catch((err) => err);

            expect(error, 'to be an', ApiError);
            expect(error, 'not to be a', ValidationError);
            expect(error, 'to satisfy', { name: 'ApiError', status: 200, body: { success: false } });
        });

        it('should reject with UnauthorizedError on the API auth errors', async () => {
            fetch.resolves(jsonResponse({ name: 'Unauthorized', message: 'Token expired', status: 401 }, 401));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', UnauthorizedError);
            expect(error, 'to satisfy', {
                name: 'UnauthorizedError',
                message: 'Token expired',
                reason: 'Token expired',
                status: 401,
                isRecoverable: true,
            });
        });

        it('should not consider unknown auth errors as recoverable', async () => {
            fetch.resolves(jsonResponse({ name: 'Unauthorized', message: 'Your account has been banned', status: 401 }, 401));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', UnauthorizedError);
            expect(error.isRecoverable, 'to be false');
        });

        it('should reject with OAuthError on the OAuth2 errors', async () => {
            fetch.resolves(jsonResponse({ error: 'invalid_scope', parameter: 'foo', statusCode: 400 }, 400));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', OAuthError);
            expect(error, 'to satisfy', {
                name: 'OAuthError',
                message: 'invalid_scope (foo)',
                error: 'invalid_scope',
                parameter: 'foo',
                status: 400,
                userMessage: "Invalid scope 'foo'.",
            });
        });

        it('should reject with OAuthError on 401 OAuth2 errors', async () => {
            fetch.resolves(
                jsonResponse({ error: 'access_denied', statusCode: 401, redirectUri: 'http://ely.by?error=access_denied' }, 401),
            );

            const error = await request.post('/api/foo').catch((err) => err);

            expect(error, 'to be an', OAuthError);
            expect(error, 'to satisfy', {
                error: 'access_denied',
                parameter: undefined,
                redirectUri: 'http://ely.by?error=access_denied',
                userMessage: null,
            });
        });

        it('should reject with OAuthError when success is false with 200 status', async () => {
            fetch.resolves(jsonResponse({ success: false, error: 'invalid_user_code', parameter: 'user_code' }));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', OAuthError);
            expect(error, 'to satisfy', { error: 'invalid_user_code', parameter: 'user_code', status: 200 });
        });

        it('should reject with ApiError on other 4xx errors', async () => {
            fetch.resolves(jsonResponse({ name: 'Not Found', message: 'Page not found.', status: 404 }, 404));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', ApiError);
            expect(error, 'to satisfy', {
                name: 'ApiError',
                message: 'Request failed with status 404',
                status: 404,
                body: { name: 'Not Found', message: 'Page not found.' },
            });
        });

        it('should resolve 2xx responses with the error field', async () => {
            fetch.resolves(jsonResponse({ error: 'not an error' }));

            const resp = await request.get<{ error: string }>('/api/foo');

            expect(resp.error, 'to be', 'not an error');
        });
    });

    describe('InternalServerError', () => {
        it('should wrap json errors', async () => {
            fetch.resolves(new Response('bad resp format', { status: 200 }));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', InternalServerError);
            expect(error.response, 'to be a', Response);
            expect(error.message, 'to contain', 'Unexpected token');
        });

        [null, 'foo', 42, true].forEach((body) =>
            it(`should wrap primitive json body ${JSON.stringify(body)}`, async () => {
                fetch.resolves(jsonResponse(body));

                const error = await request.get('/api/foo').catch((err) => err);

                expect(error, 'to be an', InternalServerError);
                expect(error.message, 'to be', 'Unexpected response body');
                expect(error.response.status, 'to be', 200);
            }),
        );

        it('should wrap 5xx errors', async () => {
            fetch.resolves(jsonResponse({}, 500));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', InternalServerError);
            expect(error, 'to be a', RequestError);
            expect(error.name, 'to be', 'InternalServerError');
            expect(error.response.status, 'to be', 500);
        });

        it('should keep the original response body readable', async () => {
            fetch.resolves(jsonResponse({ foo: 'bar' }, 500));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(await error.response.text(), 'to be', '{"foo":"bar"}');
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
            expect(error, 'to be a', RequestError);
            expect(error.name, 'to be', 'RequestAbortedError');
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
