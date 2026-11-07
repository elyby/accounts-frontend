import { account1 } from '../../fixtures/accounts.json';
import { OAuthState } from 'app/components/auth/reducer';
import { UserResponse } from 'app/services/api/accounts';

const defaults = {
    client_id: 'ely',
    redirect_uri: 'https://dev.ely.by/authorization/oauth',
    response_type: 'code',
    scope: 'account_info,account_email',
};

describe('OAuth', () => {
    describe('AuthCode grant flow', () => {
        it('should complete oauth', () => {
            cy.login({ accounts: ['default'] });

            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

            chooseAccount();

            cy.url().should('equal', 'https://dev.ely.by/');
        });

        it('should restore previous oauthData if any', () => {
            localStorage.setItem(
                'oauthData',
                JSON.stringify({
                    timestamp: Date.now() - 3600,
                    payload: {
                        params: {
                            query: {
                                client_id: 'ely',
                                redirect_uri: 'https://dev.ely.by/authorization/oauth',
                                response_type: 'code',
                                scope: 'account_info account_email',
                            },
                        },
                    } as OAuthState,
                }),
            );
            cy.login({ accounts: ['default'] });

            cy.visit('/');

            chooseAccount();

            cy.url().should('equal', 'https://dev.ely.by/');
        });

        it('should pass PKCE and OpenID Connect params to the backend as is', () => {
            const params = {
                code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
                code_challenge_method: 'S256',
                nonce: 'n-0S6_WzA2Mj',
            };

            cy.intercept('GET', '/api/oauth2/v1/validate**').as('validate');
            cy.intercept('POST', '/api/oauth2/v1/complete**').as('complete');

            cy.login({ accounts: ['default'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    scope: 'openid profile email',
                    ...params,
                })}`,
            );

            chooseAccount();

            for (const alias of ['@validate', '@complete'] as const) {
                cy.wait(alias).then(({ request }) => {
                    const query = new URL(request.url).searchParams;

                    expect(query.get('code_challenge')).to.equal(params.code_challenge);
                    expect(query.get('code_challenge_method')).to.equal(params.code_challenge_method);
                    expect(query.get('nonce')).to.equal(params.nonce);
                    expect(query.has('request')).to.equal(false);
                    expect(query.has('request_uri')).to.equal(false);
                    expect(query.has('state')).to.equal(false);
                });
            }
        });
    });

    describe('DeviceCode grant flow', () => {
        it('should complete flow by complete uri', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/code?user_code=E2E-APPROVED');

            chooseAccount();

            cy.location('pathname').should('eq', '/oauth/finish');
            cy.get('[data-e2e-content]').contains('successfully completed');
        });

        it('should complete flow with manual approve', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/code');

            cy.get('[name=user_code]').type('E2E-UNAPPROVED{enter}');

            chooseAccount();

            cy.location('pathname').should('eq', '/oauth/permissions');

            cy.findByTestId('auth-controls').contains('Approve').click();

            cy.location('pathname').should('eq', '/oauth/finish');
            cy.get('[data-e2e-content]').contains('successfully completed');
        });

        it('should complete flow with auto approve', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/code');

            cy.get('[name=user_code]').type('E2E-APPROVED{enter}');

            chooseAccount();

            cy.location('pathname').should('eq', '/oauth/finish');
            cy.get('[data-e2e-content]').contains('successfully completed');
        });

        it('should complete flow by declining the code', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/code');

            cy.get('[name=user_code]').type('E2E-UNAPPROVED{enter}');

            chooseAccount();

            cy.location('pathname').should('eq', '/oauth/permissions');

            cy.findByTestId('auth-controls-secondary').contains('Decline').click();

            cy.location('pathname').should('eq', '/oauth/finish');
            cy.get('[data-e2e-content]').contains('was failed');
        });

        it('should show an error for an unknown code', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/code');

            cy.get('[name=user_code]').type('UNKNOWN-CODE{enter}');

            cy.location('pathname').should('eq', '/code');
            cy.findByTestId('auth-error').contains('Invalid Device Code');
        });

        it('should show an error for an expired code', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/code');

            cy.get('[name=user_code]').type('E2E-EXPIRED{enter}');

            cy.location('pathname').should('eq', '/code');
            cy.findByTestId('auth-error').contains('The code has expired');
        });

        it('should show an error for an expired code', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/code');

            cy.get('[name=user_code]').type('E2E-COMPLETED{enter}');

            cy.location('pathname').should('eq', '/code');
            cy.findByTestId('auth-error').contains('This code has been already used');
        });
    });

    describe('AccountSwitcher', () => {
        it('should ask to choose an account if user has multiple', () => {
            cy.login({ accounts: ['default', 'default2'] }).then(({ accounts: [account] }) => {
                cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

                cy.url().should('include', '/oauth/choose-account');

                cy.findByTestId('auth-header').should('contain', 'Choose an account');

                cy.findByTestId('auth-body').contains(account.email).click();

                cy.url().should('equal', 'https://dev.ely.by/');
            });
        });
    });

    describe('Permissions prompt', () => {
        // TODO: remove api mocks, when we will be able to revoke permissions
        it('should prompt for permissions', () => {
            cy.intercept('POST', new RegExp('/api/oauth2/v1/complete'), {
                // NOTE: can not use cypress glob syntax, because it will break due to
                // '%2F%2F' (//) in redirect_uri
                // '/api/oauth2/v1/complete/*',
                statusCode: 401,
                body: {
                    error: 'accept_required',
                    error_description: 'Client must accept authentication request.',
                },
            }).as('complete');

            cy.login({ accounts: ['default'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    client_id: 'tlauncher',
                    redirect_uri: 'http://localhost:8080',
                    state: '123',
                })}`,
            );

            chooseAccount();

            cy.wait('@complete');

            assertPermissions();

            // stop stubbing so the click below hits the real backend
            cy.intercept('POST', new RegExp('/api/oauth2/v1/complete'), (req) => req.continue());

            cy.findByTestId('auth-controls').contains('Approve').click();

            assertRedirectedWithCode('123');
        });

        it('should redirect to error page, when permission request declined', () => {
            cy.intercept('POST', new RegExp('/api/oauth2/v1/complete'), {
                // NOTE: can not use cypress glob syntax, because it will break due to
                // '%2F%2F' (//) in redirect_uri
                // '/api/oauth2/v1/complete/*',
                statusCode: 401,
                body: {
                    error: 'accept_required',
                    error_description: 'Client must accept authentication request.',
                },
            }).as('complete');

            cy.login({ accounts: ['default'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    client_id: 'tlauncher',
                    redirect_uri: 'http://localhost:8080',
                })}`,
            );

            chooseAccount();

            cy.wait('@complete');

            assertPermissions();

            // stop stubbing so the click below hits the real backend
            cy.intercept('POST', new RegExp('/api/oauth2/v1/complete'), (req) => req.continue());

            cy.findByTestId('auth-controls-secondary').contains('Decline').click();

            cy.url().should('include', 'error=access_denied');
        });
    });

    describe('Sign-in during oauth', () => {
        it('should allow sign in during oauth (guest oauth)', () => {
            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

            cy.location('pathname').should('eq', '/login');

            cy.get('[name=login]').type(`${account1.login}{enter}`);

            cy.url().should('include', '/password');

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            cy.url().should('equal', 'https://dev.ely.by/');
        });

        const expiredTokenState = {
            accounts: {
                active: 7,
                available: [
                    {
                        id: 7,
                        username: account1.username,
                        email: account1.email,
                        token: 'expired access token',
                        refreshToken: 'expired refresh token',
                    },
                ],
            },
            user: {
                id: 7,
                uuid: '522e8c19-89d8-4a6d-a2ec-72ebb58c2dbe',
                username: account1.username,
                token: '',
                email: account1.email,
                maskedEmail: '',
                avatar: '',
                lang: 'en',
                isActive: true,
                isOtpEnabled: false,
                shouldAcceptRules: false,
                passwordChangedAt: 1478961317,
                hasMojangUsernameCollision: true,
                isGuest: false,
                registeredAt: 1478961317,
                elyProfileLink: 'http://ely.by/u7',
            },
        };

        it('should allow to relogin in during oauth (expired access and refresh tokens)', () => {
            cy.visit('/').then(() => localStorage.setItem('redux-storage', JSON.stringify(expiredTokenState)));

            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

            cy.url().should('include', '/password');

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            cy.url().should('equal', 'https://dev.ely.by/');
        });

        it('should allow to relogin with MFA in during oauth (expired access and refresh tokens)', () => {
            cy.visit('/').then(() => localStorage.setItem('redux-storage', JSON.stringify(expiredTokenState)));

            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

            cy.url().should('include', '/password');

            cy.intercept('POST', '/api/authentication/login', {
                success: false,
                errors: { totp: 'error.totp_required' },
            });

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            cy.url().should('include', '/mfa');

            cy.intercept('POST', '/api/authentication/login', (req) => req.continue());

            cy.get('[name=totp]').type('123456{enter}');

            cy.url().should('equal', 'https://dev.ely.by/');
        });
    });

    describe('Deleted account', () => {
        it('should show account switcher and then abort oauth and redirect to profile', () => {
            cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
                cy.intercept('GET', `/api/v1/accounts/${account1.id}`, {
                    id: account.id,
                    uuid: '522e8c19-89d8-4a6d-a2ec-72ebb58c2dbe',
                    username: account.username,
                    isOtpEnabled: false,
                    registeredAt: 1475568334,
                    lang: 'en',
                    elyProfileLink: 'http://ely.by/u7',
                    email: account.email,
                    isActive: true,
                    isDeleted: true, // force user into the deleted state
                    passwordChangedAt: 1476075696,
                    hasMojangUsernameCollision: true,
                    shouldAcceptRules: false,
                } as UserResponse);

                cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

                cy.findByTestId('auth-header').should('contain', 'Choose an account');

                cy.findByTestId('auth-body').contains(account.email).click();

                cy.location('pathname').should('eq', '/');
                cy.findByTestId('deletedAccount').should('contain', 'Account is deleted');
            });
        });

        it('should allow sign and then abort oauth and redirect to profile', () => {
            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

            cy.location('pathname').should('eq', '/login');

            cy.get('[name=login]').type(`${account1.login}{enter}`);

            cy.url().should('include', '/password');

            cy.intercept('GET', `/api/v1/accounts/${account1.id}`, {
                id: 7,
                uuid: '522e8c19-89d8-4a6d-a2ec-72ebb58c2dbe',
                username: 'SleepWalker',
                isOtpEnabled: false,
                registeredAt: 1475568334,
                lang: 'en',
                elyProfileLink: 'http://ely.by/u7',
                email: 'danilenkos@auroraglobal.com',
                isActive: true,
                isDeleted: true, // force user into the deleted state
                passwordChangedAt: 1476075696,
                hasMojangUsernameCollision: true,
                shouldAcceptRules: false,
            } as UserResponse);

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            cy.location('pathname').should('eq', '/');
            cy.findByTestId('deletedAccount').should('contain', 'Account is deleted');
        });
    });

    describe('login_hint', () => {
        it('should automatically choose account, when id in login_hint is present', () => {
            cy.login({ accounts: ['default', 'default2'] }).then(({ accounts: [account] }) => {
                cy.visit(
                    `/oauth2/v1/ely?${new URLSearchParams({
                        ...defaults,
                        // suggest preferred username
                        // https://docs.ely.by/ru/oauth.html#id3
                        login_hint: String(account.id),
                    }).toString()}`,
                );

                cy.url().should('equal', 'https://dev.ely.by/');
            });
        });

        it('should automatically choose account, when email in login_hint is present', () => {
            cy.login({ accounts: ['default', 'default2'] }).then(({ accounts: [account] }) => {
                cy.visit(
                    `/oauth2/v1/ely?${new URLSearchParams({
                        ...defaults,
                        // suggest preferred username
                        // https://docs.ely.by/ru/oauth.html#id3
                        login_hint: account.email,
                    })}`,
                );

                cy.url().should('equal', 'https://dev.ely.by/');
            });
        });

        it('should automatically choose account, when username in login_hint is present and it is not an active account', () => {
            cy.login({ accounts: ['default2', 'default'] }).then(
                ({
                    // try to authenticate with an account, that is not currently active one
                    accounts: [, account],
                }) => {
                    cy.visit(
                        `/oauth2/v1/ely?${new URLSearchParams({
                            ...defaults,
                            // suggest preferred username
                            // https://docs.ely.by/ru/oauth.html#id3
                            login_hint: account.username,
                        })}`,
                    );

                    cy.url().should('equal', 'https://dev.ely.by/');
                },
            );
        });
    });

    describe('prompts', () => {
        it('should prompt for account', () => {
            cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
                cy.visit(
                    `/oauth2/v1/ely?${new URLSearchParams({
                        ...defaults,
                        prompt: 'select_account',
                    })}`,
                );

                cy.url().should('include', '/oauth/choose-account');

                cy.findByTestId('auth-header').should('contain', 'Choose an account');

                cy.findByTestId('auth-body').contains(account.email).click();

                cy.url().should('equal', 'https://dev.ely.by/');
            });
        });

        it('should skip the account switcher and use the active account', () => {
            cy.login({ accounts: ['default', 'default2'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    prompt: 'skip_account_selection',
                })}`,
            );

            cy.url().should('equal', 'https://dev.ely.by/');
        });

        it('should allow sign in with another account', () => {
            cy.login({ accounts: ['default2'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    prompt: 'select_account',
                })}`,
            );

            cy.url().should('include', '/oauth/choose-account');

            cy.findByTestId('auth-controls').contains('another account').click();

            cy.location('pathname').should('eq', '/login');

            cy.get('[name=login]').type(`${account1.login}{enter}`);

            cy.url().should('include', '/password');

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            cy.url().should('equal', 'https://dev.ely.by/');
        });

        it('should prompt for permissions', () => {
            cy.login({ accounts: ['default'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    client_id: 'tlauncher',
                    redirect_uri: 'http://localhost:8080',
                    prompt: 'consent',
                })}`,
            );

            chooseAccount();

            assertPermissions();

            cy.findByTestId('auth-controls').contains('Approve').click();

            assertRedirectedWithCode();
        });

        it('should redirect to error page, when permission request declined', () => {
            cy.login({ accounts: ['default'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    client_id: 'tlauncher',
                    redirect_uri: 'http://localhost:8080',
                    prompt: 'consent',
                })}`,
            );

            chooseAccount();

            cy.url().should('include', '/oauth/permissions');

            cy.findByTestId('auth-controls-secondary').contains('Decline').click();

            cy.url().should('include', 'error=access_denied');
        });

        it('should prompt for both account and permissions', () => {
            cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
                cy.visit(
                    `/oauth2/v1/ely?${new URLSearchParams({
                        ...defaults,
                        client_id: 'tlauncher',
                        redirect_uri: 'http://localhost:8080',
                        prompt: 'select_account,consent',
                    })}`,
                );

                cy.url().should('include', '/oauth/choose-account');

                cy.findByTestId('auth-header').should('contain', 'Choose an account');

                cy.findByTestId('auth-body').contains(account.email).click();

                assertPermissions();

                cy.findByTestId('auth-controls').contains('Approve').click();

                assertRedirectedWithCode();
            });
        });

        it('should allow sign in during oauth (guest oauth)', () => {
            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    client_id: 'tlauncher',
                    redirect_uri: 'http://localhost:8080',
                    prompt: 'select_account,consent',
                })}`,
            );

            cy.location('pathname').should('eq', '/login');

            cy.get('[name=login]').type(`${account1.login}{enter}`);

            cy.url().should('include', '/password');

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            assertPermissions();

            cy.findByTestId('auth-controls').contains('Approve').click();

            assertRedirectedWithCode();
        });
    });

    describe('prompt=none', () => {
        // The client, that returns the user to the localhost:8080, which is the app itself in the tests
        const silentRequest = {
            ...defaults,
            client_id: 'tlauncher',
            redirect_uri: 'http://localhost:8080',
            state: '123',
            prompt: 'none',
        };

        beforeEach(() => {
            // The app would redirect the guest from its own main page to /login and the error params would be lost
            cy.intercept('GET', /^http:\/\/localhost:8080\/?\?(.+&)?error=/, {
                statusCode: 200,
                headers: { 'content-type': 'text/html' },
                body: '<html><body>The client</body></html>',
            });
        });

        it('should complete silently with the single account', () => {
            cy.login({ accounts: ['default'] });

            cy.visit(`/oauth2/v1/ely?${new URLSearchParams({ ...defaults, prompt: 'none' })}`);

            cy.url().should('equal', 'https://dev.ely.by/');
        });

        it('should complete silently with the login_hint account, when there are multiple accounts', () => {
            cy.login({ accounts: ['default2', 'default'] }).then(({ accounts: [, account] }) => {
                cy.visit(
                    `/oauth2/v1/ely?${new URLSearchParams({ ...defaults, prompt: 'none', login_hint: account.email })}`,
                );

                cy.url().should('equal', 'https://dev.ely.by/');
            });
        });

        it('should return login_required for a guest and not remember the request', () => {
            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(silentRequest)}`);

            assertRedirectedWithError('login_required', '123');
            cy.window().then((win) => expect(win.localStorage.getItem('oauthData')).to.equal(null));
        });

        it('should return account_selection_required for multiple accounts', () => {
            cy.login({ accounts: ['default', 'default2'] });

            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(silentRequest)}`);

            assertRedirectedWithError('account_selection_required', '123');
        });

        it('should return login_required, when the login_hint account is not logged in', () => {
            cy.login({ accounts: ['default'] });

            cy.visit(`/oauth2/v1/ely?${new URLSearchParams({ ...silentRequest, login_hint: 'unknown@ely.by' })}`);

            assertRedirectedWithError('login_required', '123');
        });

        it('should return invalid_request, when none is combined with other values', () => {
            cy.login({ accounts: ['default'] });

            cy.visit(`/oauth2/v1/ely?${new URLSearchParams({ ...silentRequest, prompt: 'none consent' })}`);

            assertRedirectedWithError('invalid_request', '123');
        });

        it('should return consent_required, when the permissions must be accepted', () => {
            cy.intercept('POST', new RegExp('/api/oauth2/v1/complete'), {
                statusCode: 401,
                body: {
                    error: 'accept_required',
                    error_description: 'Client must accept authentication request.',
                },
            });

            cy.login({ accounts: ['default'] });

            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(silentRequest)}`);

            assertRedirectedWithError('consent_required', '123');
        });

        it('should return interaction_required, when the rules must be accepted', () => {
            cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
                cy.intercept('GET', `/api/v1/accounts/${account.id}`, (req) => {
                    req.continue((res) => {
                        res.body.shouldAcceptRules = true;
                    });
                });

                cy.visit(`/oauth2/v1/ely?${new URLSearchParams(silentRequest)}`);

                assertRedirectedWithError('interaction_required', '123');
            });
        });

        it('should return interaction_required for a deleted account', () => {
            cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
                cy.intercept('GET', `/api/v1/accounts/${account.id}`, (req) => {
                    req.continue((res) => {
                        res.body.isDeleted = true;
                    });
                });

                cy.visit(`/oauth2/v1/ely?${new URLSearchParams(silentRequest)}`);

                assertRedirectedWithError('interaction_required', '123');
            });
        });

        it('should be ignored for the device code flow', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/code?user_code=E2E-APPROVED&prompt=none');

            // The account switcher is shown as usual
            chooseAccount();

            cy.location('pathname').should('eq', '/oauth/finish');
            cy.get('[data-e2e-content]').contains('successfully completed');
        });
    });
});

/**
 * The account switcher is always shown during oauth for the logged in user
 */
function chooseAccount(email: string = account1.email) {
    cy.url().should('include', '/oauth/choose-account');

    cy.findByTestId('auth-body').contains(email).click();
}

function assertPermissions() {
    cy.url().should('include', '/oauth/permissions');

    cy.findByTestId('auth-header').should('contain', 'Application permissions');
    cy.findByTestId('auth-body').should('contain', 'Access to your profile data (except E‑mail)');
    cy.findByTestId('auth-body').should('contain', 'Access to your E‑mail address');
}

/**
 * Checks only the params, that matter for the client, so the other params added by the backend don't break it
 */
function assertRedirectedWithCode(state?: string) {
    cy.location('origin').should('equal', 'http://localhost:8080');
    cy.location('search').should((search) => {
        const query = new URLSearchParams(search);

        expect(query.get('code')).to.be.a('string').and.not.be.empty;

        if (state !== undefined) {
            expect(query.get('state')).to.equal(state);
        }
    });
}

/**
 * Checks only the params, that matter for the client, so the other params added by the backend don't break it
 */
function assertRedirectedWithError(error: string, state?: string) {
    cy.location('origin').should('equal', 'http://localhost:8080');
    cy.location('search').should((search) => {
        const query = new URLSearchParams(search);

        expect(query.get('error')).to.equal(error);

        if (state !== undefined) {
            expect(query.get('state')).to.equal(state);
        }
    });
}
