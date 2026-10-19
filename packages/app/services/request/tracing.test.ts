import expect from 'app/test/unexpected';

import { getUrlTemplate, parseSampleRate, sanitizeRequestUrl } from './tracing';

describe('services/request/tracing', () => {
    describe('getUrlTemplate', () => {
        const cases: Array<[string, string, string]> = [
            ['GET', '/api/options', '/api/options'],
            ['POST', '/api/authentication/refresh-token', '/api/authentication/refresh-token'],
            ['GET', '/api/v1/accounts/123', '/api/v1/accounts/{id}'],
            ['DELETE', '/api/v1/accounts/123', '/api/v1/accounts/{id}'],
            ['POST', '/api/v1/accounts/123/password', '/api/v1/accounts/{id}/password'],
            ['GET', '/api/v1/accounts/123/two-factor-auth', '/api/v1/accounts/{id}/two-factor-auth'],
            ['GET', '/api/v1/accounts/123/oauth2/clients', '/api/v1/accounts/{id}/oauth2/clients'],
            ['POST', '/api/v1/oauth2/application', '/api/v1/oauth2/application'],
            ['POST', '/api/v1/oauth2/minecraft-server', '/api/v1/oauth2/minecraft-server'],
            ['GET', '/api/v1/oauth2/my-client', '/api/v1/oauth2/{clientId}'],
            ['PUT', '/api/v1/oauth2/my-client', '/api/v1/oauth2/{clientId}'],
            ['DELETE', '/api/v1/oauth2/my-client', '/api/v1/oauth2/{clientId}'],
            ['POST', '/api/v1/oauth2/my-client/reset', '/api/v1/oauth2/{clientId}/reset'],
            ['POST', '/api/v1/oauth2/my-client/reset?regenerateSecret', '/api/v1/oauth2/{clientId}/reset'],
            ['GET', '/api/oauth2/v1/validate?client_id=foo&state=bar', '/api/oauth2/v1/validate'],
            ['GET', 'https://account.ely.by/api/v1/accounts/1', '/api/v1/accounts/{id}'],
        ];

        cases.forEach(([method, url, expected]) => {
            it(`should return ${expected} for ${method} ${url}`, () => {
                expect(getUrlTemplate(method, url), 'to be', expected);
            });
        });
    });

    describe('sanitizeRequestUrl', () => {
        const { origin } = window.location;

        it('should replace the variable parts of the API urls and drop the query', () => {
            expect(
                sanitizeRequestUrl('GET', `${origin}/api/v1/accounts/123?foo=bar`),
                'to be',
                `${origin}/api/v1/accounts/{id}`,
            );
            expect(
                sanitizeRequestUrl('GET', '/api/oauth2/v1/validate?client_id=foo&state=secret'),
                'to be',
                `${origin}/api/oauth2/v1/validate`,
            );
        });

        it('should take the method into account', () => {
            expect(
                sanitizeRequestUrl('POST', `${origin}/api/v1/oauth2/application`),
                'to be',
                `${origin}/api/v1/oauth2/application`,
            );
            expect(
                sanitizeRequestUrl('GET', `${origin}/api/v1/oauth2/my-client`),
                'to be',
                `${origin}/api/v1/oauth2/{clientId}`,
            );
        });

        it('should only drop the query and the hash of the other urls', () => {
            expect(
                sanitizeRequestUrl('GET', 'https://www.google.com/recaptcha/api/v1/accounts/1?k=secret#hash'),
                'to be',
                'https://www.google.com/recaptcha/api/v1/accounts/1',
            );
            expect(sanitizeRequestUrl('GET', `${origin}/locales/en.json?v=1`), 'to be', `${origin}/locales/en.json`);
        });
    });

    describe('parseSampleRate', () => {
        it('should parse valid rates', () => {
            expect(parseSampleRate('0'), 'to be', 0);
            expect(parseSampleRate('0.1'), 'to be', 0.1);
            expect(parseSampleRate('1'), 'to be', 1);
            expect(parseSampleRate(0.5), 'to be', 0.5);
        });

        it('should disable tracing for empty or invalid values', () => {
            expect(parseSampleRate(undefined), 'to be undefined');
            expect(parseSampleRate(null), 'to be undefined');
            expect(parseSampleRate(''), 'to be undefined');
            expect(parseSampleRate('abc'), 'to be undefined');
            expect(parseSampleRate('-0.1'), 'to be undefined');
            expect(parseSampleRate('1.5'), 'to be undefined');
        });
    });
});
