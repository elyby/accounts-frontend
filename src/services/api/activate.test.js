import expect from 'test/unexpected';
import sinon from 'sinon';

import request from 'services/request';
import signup from 'services/api/signup';

describe('signup api', () => {
    describe('#register', () => {
        const params = {
            email: 'email',
            username: 'username',
            password: 'password',
            rePassword: 'rePassword',
            rulesAgreement: false,
            lang: 'lang',
            captcha: 'captcha'
        };

        beforeEach(() => {
            sinon.stub(request, 'post').named('request.post');
        });

        afterEach(() => {
            request.post.restore();
        });

        it('should post to register api', () => {
            signup.register(params);

            expect(request.post, 'to have a call satisfying', [
                '/api/signup', params, {}
            ]);
        });

        it('should disable any token', () => {
            signup.register(params);

            expect(request.post, 'to have a call satisfying', [
                '/api/signup', params, {token: null}
            ]);
        });
    });

    describe('#activate', () => {
        const params = {
            key: 'key'
        };

        beforeEach(() => {
            sinon.stub(request, 'post').named('request.post');
        });

        afterEach(() => {
            request.post.restore();
        });

        it('should post to confirmation api', () => {
            signup.activate(params);

            expect(request.post, 'to have a call satisfying', [
                '/api/signup/confirm', params, {}
            ]);
        });

        it('should disable any token', () => {
            signup.activate(params);

            expect(request.post, 'to have a call satisfying', [
                '/api/signup/confirm', params, {token: null}
            ]);
        });
    });
});
