import expect from 'app/test/unexpected';
import sinon, { SinonStub } from 'sinon';

import createAuthHooks from 'app/components/user/authHooks';
import { updateToken } from 'app/components/accounts/actions';
import { browserHistory } from 'app/services/history';
import * as authentication from 'app/services/api/authentication';
import * as request from 'app/services/request';
import { InternalServerError, OAuthError, RequestAbortedError, UnauthorizedError, ValidationError } from 'app/services/request';

const refreshToken = 'foo';
const expiredToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0NzA3NjE0NDMsImV4cCI6MTQ3MDc2MTQ0MywiaWF0IjoxNDcwNzYxNDQzLCJqdGkiOiJpZDEyMzQ1NiJ9.gWdnzfQQvarGpkbldUvB8qdJZSVkvdNtCbhbbl2yJW8';
// valid till 2100 year
const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0NzA3NjE5NzcsImV4cCI6NDEwMjQ0NDgwMCwiaWF0IjoxNDcwNzYxOTc3LCJqdGkiOiJpZDEyMzQ1NiJ9.M4KY4QgHOUzhpAZjWoHJbGsEJPR-RBsJ1c1BKyxvAoU';
const email = 'test@email.com';

const jsonResponse = (body: any, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// The hooks are registered once for the module, so the store is mutable
const getState = sinon.stub();
const dispatch: SinonStub = sinon.stub();
request.addHooks(createAuthHooks({ getState, dispatch } as any));

describe('authHooks', () => {
    let fetch: SinonStub;

    const setAccount = (account: Record<string, any> | null) =>
        getState.returns({
            accounts: {
                active: account ? account.id : null,
                available: account ? [account] : [],
            },
            auth: { credentials: {} },
            user: {},
        });

    const authHeaders = () =>
        fetch.getCalls().map(({ args: [req] }) => (req as Request).headers.get('Authorization'));

    beforeEach(() => {
        fetch = sinon.stub(globalThis, 'fetch').named('fetch');
        sinon.stub(authentication, 'requestToken').named('authentication.requestToken');
        sinon.stub(authentication, 'logout').named('authentication.logout').resolves();
        sinon.stub(browserHistory, 'push');

        getState.reset();
        dispatch.reset();
        dispatch.callsFake((arg) => {
            if (typeof arg !== 'function') {
                // emulate the reducer for the token update
                if (arg.type === updateToken('').type) {
                    const { accounts } = getState();
                    setAccount({ ...accounts.available[0], token: arg.payload });
                }

                return arg;
            }

            return arg(dispatch, getState);
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    function assertRelogin() {
        expect(dispatch, 'to have a call satisfying', [
            { type: 'auth:setCredentials', payload: { login: email, returnUrl: expect.it('to be a string') } },
        ]);
        expect(browserHistory.push, 'to have a call satisfying', ['/login']);
    }

    it('must be till 2100 to test with validToken', () => expect(new Date().getFullYear(), 'to be less than', 2100));

    describe('Authorization header', () => {
        it('should use the active account token', async () => {
            setAccount({ id: 42, email, token: validToken, refreshToken });
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo');

            expect(authHeaders(), 'to equal', [`Bearer ${validToken}`]);
        });

        it('should not be set for guests', async () => {
            setAccount(null);
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo');

            expect(authHeaders(), 'to equal', [null]);
        });

        it('should be overridden with the token option', async () => {
            setAccount({ id: 42, email, token: validToken, refreshToken });
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo', {}, { token: 'custom' });

            expect(authHeaders(), 'to equal', ['Bearer custom']);
        });

        it('should be removed with token: null', async () => {
            setAccount({ id: 42, email, token: validToken, refreshToken });
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo', {}, { token: null });

            expect(authHeaders(), 'to equal', [null]);
        });

        it('should use the active account token when token is undefined', async () => {
            setAccount({ id: 42, email, token: validToken, refreshToken });
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo', {}, { token: undefined });

            expect(authHeaders(), 'to equal', [`Bearer ${validToken}`]);
        });
    });

    describe('when token expired', () => {
        beforeEach(() => {
            setAccount({ id: 42, email, token: expiredToken, refreshToken });
        });

        it('should request a new token before the request', async () => {
            (authentication.requestToken as SinonStub).resolves(validToken);
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo');

            expect(authentication.requestToken, 'to have calls satisfying', [[refreshToken]]);
            expect(dispatch, 'to have a call satisfying', [updateToken(validToken)]);
            expect(authHeaders(), 'to equal', [`Bearer ${validToken}`]);
        });

        it('should request a new token only once for concurrent requests', async () => {
            (authentication.requestToken as SinonStub).resolves(validToken);
            fetch.callsFake(async () => jsonResponse({}));

            await Promise.all([request.get('/api/foo'), request.get('/api/bar'), request.post('/api/baz')]);

            expect(authentication.requestToken, 'was called once');
            expect(authHeaders(), 'to equal', [`Bearer ${validToken}`, `Bearer ${validToken}`, `Bearer ${validToken}`]);
        });

        it('should not refresh when the token option is passed', async () => {
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo', {}, { token: null });

            expect(authentication.requestToken, 'was not called');
        });

        it('should not relogin if token request failed with 5xx', async () => {
            const resp = new InternalServerError(new Response('{}', { status: 500 }));
            (authentication.requestToken as SinonStub).rejects(resp);

            await expect(request.get('/api/foo'), 'to be rejected with', resp);

            expect(fetch, 'was not called');
            expect(browserHistory.push, 'was not called');
            expect(dispatch, 'to have no calls satisfying', [{ type: 'auth:setCredentials' }]);
        });

        it('should not relogin if token request failed with network error', async () => {
            (authentication.requestToken as SinonStub).rejects(new RequestAbortedError(new TypeError('Failed to fetch')));

            await expect(request.get('/api/foo'), 'to be rejected');

            expect(fetch, 'was not called');
            expect(browserHistory.push, 'was not called');
        });

        it('should relogin if the backend rejected the refresh token', async () => {
            (authentication.requestToken as SinonStub).rejects(
                new ValidationError(new Response('{}', { status: 200 }), {
                    success: false,
                    errors: { refresh_token: 'error.refresh_token_not_exist' },
                }),
            );

            await expect(request.get('/api/foo'), 'to be rejected');

            expect(fetch, 'was not called');
            assertRelogin();
        });
    });

    describe('when token can not be parsed', () => {
        it('should refresh the token', async () => {
            setAccount({ id: 42, email, token: 'realy bad token', refreshToken });
            (authentication.requestToken as SinonStub).resolves(validToken);
            fetch.resolves(jsonResponse({}));

            await request.get('/api/foo');

            expect(authentication.requestToken, 'to have a call satisfying', [refreshToken]);
            expect(authHeaders(), 'to equal', [`Bearer ${validToken}`]);
        });

        it('should relogin if there is no refresh token', async () => {
            setAccount({ id: 42, email, token: 'realy bad token', refreshToken: null });
            fetch.resolves(jsonResponse({ name: 'Unauthorized', message: 'Incorrect token', status: 401 }, 401));

            await expect(request.get('/api/foo'), 'to be rejected with', expect.it('to be an', UnauthorizedError));

            expect(authentication.requestToken, 'was not called');
            assertRelogin();
        });
    });

    describe('on 401 response', () => {
        beforeEach(() => {
            setAccount({ id: 42, email, token: validToken, refreshToken });
        });

        ['Token expired', 'Incorrect token', 'You are requesting with an invalid credential.'].forEach((message) =>
            it(`should refresh token and retry the request for "${message}"`, async () => {
                const newToken = `${validToken}.new`;
                (authentication.requestToken as SinonStub).resolves(newToken);
                fetch.onFirstCall().resolves(jsonResponse({ name: 'Unauthorized', message, status: 401 }, 401));
                fetch.onSecondCall().resolves(jsonResponse({ foo: 'bar' }));

                const resp = await request.post<{ foo: string }>('/api/foo', { foo: 1 });

                expect(resp.foo, 'to be', 'bar');
                expect(authHeaders(), 'to equal', [`Bearer ${validToken}`, `Bearer ${newToken}`]);
            }),
        );

        it('should retry only once', async () => {
            (authentication.requestToken as SinonStub).resolves(validToken);
            fetch.callsFake(async () =>
                jsonResponse({ name: 'Unauthorized', message: 'Token expired', status: 401 }, 401),
            );

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', UnauthorizedError);
            expect(error.status, 'to be', 401);
            expect(fetch, 'was called twice');
        });

        it('should refresh token again for the next request', async () => {
            (authentication.requestToken as SinonStub).resolves(validToken);
            const unauthorized = () => jsonResponse({ name: 'Unauthorized', message: 'Token expired', status: 401 }, 401);
            fetch.onCall(0).callsFake(async () => unauthorized());
            fetch.onCall(1).callsFake(async () => jsonResponse({}));
            fetch.onCall(2).callsFake(async () => unauthorized());
            fetch.onCall(3).callsFake(async () => jsonResponse({}));

            await request.get('/api/foo');
            await request.get('/api/bar');

            expect(authentication.requestToken, 'was called twice');
            expect(fetch, 'was called times', 4);
        });

        it('should relogin on an unknown 401 error', async () => {
            fetch.resolves(jsonResponse({ name: 'Unauthorized', message: 'Something else', status: 401 }, 401));

            const error = await request.get('/api/foo').catch((err) => err);

            expect(error, 'to be an', UnauthorizedError);
            expect(fetch, 'was called once');
            expect(authentication.requestToken, 'was not called');
            assertRelogin();
        });

        it('should not relogin if token request failed with 5xx', async () => {
            (authentication.requestToken as SinonStub).rejects(
                new InternalServerError(new Response('{}', { status: 500 })),
            );
            fetch.resolves(jsonResponse({ name: 'Unauthorized', message: 'Token expired', status: 401 }, 401));

            await expect(request.get('/api/foo'), 'to be rejected');

            expect(fetch, 'was called once');
            expect(browserHistory.push, 'was not called');
            expect(dispatch, 'to have no calls satisfying', [{ type: 'auth:setCredentials' }]);
        });

        it('should pass through oauth 401 errors', async () => {
            fetch.resolves(jsonResponse({ statusCode: 401, error: 'access_denied', redirectUri: 'x' }, 401));

            const error = await request.post('/api/oauth2/v1/complete').catch((err) => err);

            expect(error, 'to be an', OAuthError);
            expect(error, 'to satisfy', { status: 401, error: 'access_denied', redirectUri: 'x' });
            expect(fetch, 'was called once');
            expect(authentication.requestToken, 'was not called');
            expect(browserHistory.push, 'was not called');
        });

        it('should not refresh when the token option is passed', async () => {
            fetch.resolves(jsonResponse({ name: 'Unauthorized', message: 'Token expired', status: 401 }, 401));

            await expect(request.get('/api/foo', {}, { token: 'custom' }), 'to be rejected');

            expect(fetch, 'was called once');
            expect(authentication.requestToken, 'was not called');
        });
    });
});
