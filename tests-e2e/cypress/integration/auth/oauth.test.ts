import { account1 } from '../../fixtures/accounts.json';

const defaults = {
    client_id: 'ely',
    redirect_uri: 'https://dev.ely.by/authorization/oauth',
    response_type: 'code',
    scope: 'account_info,account_email',
};

describe('OAuth', () => {
    it('should complete oauth', () => {
        cy.login({ accounts: ['default'] });

        cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

        cy.url().should('equal', 'https://dev.ely.by/');
    });

    it('should restore previous oauthData if any', () => {
        localStorage.setItem(
            'oauthData',
            JSON.stringify({
                timestamp: Date.now() - 3600,
                payload: {
                    clientId: 'ely',
                    redirectUrl: 'https://dev.ely.by/authorization/oauth',
                    responseType: 'code',
                    description: null,
                    scope: 'account_info account_email',
                    loginHint: null,
                    state: null,
                },
            }),
        );
        cy.login({ accounts: ['default'] });

        cy.visit('/');

        cy.url().should('equal', 'https://dev.ely.by/');
    });

    it('should ask to choose an account if user has multiple', () => {
        cy.login({ accounts: ['default', 'default2'] }).then(({ accounts: [account] }) => {
            cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

            cy.url().should('include', '/oauth/choose-account');

            cy.findByTestId('auth-header').should('contain', 'Choose an account');

            cy.findByTestId('auth-body').contains(account.email).click();

            cy.url().should('equal', 'https://dev.ely.by/');
        });
    });

    // TODO: remove api mocks, when we will be able to revoke permissions
    it('should prompt for permissions', () => {
        cy.server();

        cy.route({
            method: 'POST',
            // NOTE: can not use cypress glob syntax, because it will break due to
            // '%2F%2F' (//) in redirect_uri
            // url: '/api/oauth2/v1/complete/*',
            url: new RegExp('/api/oauth2/v1/complete'),
            response: {
                statusCode: 401,
                error: 'accept_required',
            },
            status: 401,
        }).as('complete');

        cy.login({ accounts: ['default'] });

        cy.visit(
            `/oauth2/v1/ely?${new URLSearchParams({
                ...defaults,
                client_id: 'tlauncher',
                redirect_uri: 'http://localhost:8080',
            })}`,
        );

        cy.wait('@complete');

        assertPermissions();

        cy.server({ enable: false });

        cy.findByTestId('auth-controls').contains('Approve').click();

        cy.url().should('match', /^http:\/\/localhost:8080\/?\?code=[^&]+&state=$/);
    });

    it('should allow sign in during oauth (guest oauth)', () => {
        cy.visit(`/oauth2/v1/ely?${new URLSearchParams(defaults)}`);

        cy.url().should('include', '/login');

        cy.get('[name=login]').type(`${account1.login}{enter}`);

        cy.url().should('include', '/password');

        cy.get('[name=password]').type(`${account1.password}{enter}`);

        cy.url().should('equal', 'https://dev.ely.by/');
    });

    // TODO: enable, when backend api will return correct response on auth decline
    xit('should redirect to error page, when permission request declined', () => {
        cy.server();

        cy.route({
            method: 'POST',
            // NOTE: can not use cypress glob syntax, because it will break due to
            // '%2F%2F' (//) in redirect_uri
            // url: '/api/oauth2/v1/complete/*',
            url: new RegExp('/api/oauth2/v1/complete'),
            response: {
                statusCode: 401,
                error: 'accept_required',
            },
            status: 401,
        }).as('complete');

        cy.login({ accounts: ['default'] });

        cy.visit(
            `/oauth2/v1/ely?${new URLSearchParams({
                ...defaults,
                client_id: 'tlauncher',
                redirect_uri: 'http://localhost:8080',
            })}`,
        );

        cy.wait('@complete');

        assertPermissions();

        cy.server({ enable: false });

        cy.findByTestId('auth-controls-secondary').contains('Decline').click();

        cy.url().should('include', 'error=access_denied');
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

            cy.url().should('include', '/login');

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

            assertPermissions();

            cy.findByTestId('auth-controls').contains('Approve').click();

            cy.url().should('match', /^http:\/\/localhost:8080\/?\?code=[^&]+&state=$/);
        });

        // TODO: enable, when backend api will return correct response on auth decline
        xit('should redirect to error page, when permission request declined', () => {
            cy.login({ accounts: ['default'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    client_id: 'tlauncher',
                    redirect_uri: 'http://localhost:8080',
                    prompt: 'consent',
                })}`,
            );

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

                cy.url().should('match', /^http:\/\/localhost:8080\/?\?code=[^&]+&state=$/);
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

            cy.url().should('include', '/login');

            cy.get('[name=login]').type(`${account1.login}{enter}`);

            cy.url().should('include', '/password');

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            assertPermissions();

            cy.findByTestId('auth-controls').contains('Approve').click();

            cy.url().should('match', /^http:\/\/localhost:8080\/?\?code=[^&]+&state=$/);
        });
    });

    describe('static pages', () => {
        it('should authenticate using static page', () => {
            cy.server();
            cy.route({
                method: 'POST',
                url: '/api/oauth2/v1/complete**',
            }).as('complete');

            cy.login({ accounts: ['default'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    client_id: 'tlauncher',
                    redirect_uri: 'static_page',
                })}`,
            );

            cy.wait('@complete');

            cy.url().should('include', 'oauth/finish#{%22auth_code%22:');
        });

        it('should authenticate using static page with code', () => {
            cy.server();
            cy.route({
                method: 'POST',
                url: '/api/oauth2/v1/complete**',
            }).as('complete');

            cy.login({ accounts: ['default'] });

            cy.visit(
                `/oauth2/v1/ely?${new URLSearchParams({
                    ...defaults,
                    client_id: 'tlauncher',
                    redirect_uri: 'static_page_with_code',
                })}`,
            );

            cy.wait('@complete');

            cy.url().should('include', 'oauth/finish#{%22auth_code%22:');

            cy.findByTestId('oauth-code-container').should('contain', 'provide the following code');

            // just click on copy, but we won't assert if the string was copied
            // because it is a little bit complicated
            // https://github.com/cypress-io/cypress/issues/2752
            cy.findByTestId('oauth-code-container').contains('Copy').click();
        });
    });
});

function assertPermissions() {
    cy.url().should('include', '/oauth/permissions');

    cy.findByTestId('auth-header').should('contain', 'Application permissions');
    cy.findByTestId('auth-body').should('contain', 'Access to your profile data (except E‑mail)');
    cy.findByTestId('auth-body').should('contain', 'Access to your E‑mail address');
}
