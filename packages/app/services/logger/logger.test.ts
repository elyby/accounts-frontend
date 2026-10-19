import expect from 'app/test/unexpected';

import { getPageTemplate, sanitizePageUrl } from './logger';

describe('services/logger', () => {
    describe('getPageTemplate', () => {
        const cases: Array<[string, string]> = [
            ['/', '/'],
            ['/login', '/login'],
            ['/profile/mfa/step2', '/profile/mfa/step2'],
            ['/activation', '/activation'],
            ['/activation/secret-key', '/activation/{key}'],
            ['/recover-password', '/recover-password'],
            ['/recover-password/secret-key', '/recover-password/{key}'],
            ['/profile/change-email', '/profile/change-email'],
            ['/profile/change-email/step2', '/profile/change-email/step2'],
            ['/profile/change-email/step3/secret-code', '/profile/change-email/step3/{code}'],
            ['/dev/applications', '/dev/applications'],
            ['/dev/applications/new', '/dev/applications/new'],
            ['/dev/applications/my-client', '/dev/applications/{clientId}'],
            ['/oauth2/v1', '/oauth2/v1'],
            ['/oauth2/v1/my-client', '/oauth2/v1/{clientId}'],
            ['/oauth2/code/success', '/oauth2/code/success'],
        ];

        cases.forEach(([path, expected]) => {
            it(`should return ${expected} for ${path}`, () => {
                expect(getPageTemplate(path), 'to be', expected);
            });
        });
    });

    describe('sanitizePageUrl', () => {
        it('should replace the secret parts of the path', () => {
            expect(
                sanitizePageUrl('https://account.ely.by/recover-password/secret-key'),
                'to be',
                'https://account.ely.by/recover-password/{key}',
            );
        });

        it('should drop the query and the hash', () => {
            expect(
                sanitizePageUrl('https://account.ely.by/oauth2/v1/my-client?state=secret&client_id=foo#hash'),
                'to be',
                'https://account.ely.by/oauth2/v1/{clientId}',
            );
        });

        it('should keep the regular urls', () => {
            expect(sanitizePageUrl('https://account.ely.by/profile'), 'to be', 'https://account.ely.by/profile');
        });

        it('should sanitize a relative url', () => {
            expect(sanitizePageUrl('/login?foo=bar#hash'), 'to be', '/login');
            expect(sanitizePageUrl('/activation/secret-key?foo=bar'), 'to be', '/activation/{key}');
        });
    });
});
