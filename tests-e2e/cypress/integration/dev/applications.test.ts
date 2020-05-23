describe('Applications', () => {
    describe('user', () => {
        before(() => {
            cy.login({ accounts: ['default'] }).then(({ accounts: [user] }) => {
                cy.visit('/dev/applications');

                // remove all previously added apps
                cy.window().then(async (win) => {
                    const { oauthApi } = (win as any) as {
                        oauthApi: typeof import('app/services/api/oauth').default;
                    };
                    const apps = await oauthApi.getAppsByUser(user.id);

                    await Promise.all(apps.map((app) => oauthApi.delete(app.clientId)));
                });
            });
        });

        it('should add website app', () => {
            cy.server();
            cy.route({
                method: 'POST',
                url: '/api/v1/oauth2/*/reset',
            }).as('revoke');
            cy.route({
                method: 'DELETE',
                url: '/api/v1/oauth2/*',
            }).as('delete');
            cy.route({
                method: 'POST',
                url: '/api/v1/oauth2/*/reset?regenerateSecret',
            }).as('revokeSecret');

            cy.visit('/dev/applications');

            cy.get('[data-e2e="noApps"]').should('exist');

            cy.get('[data-e2e="newApp"]').click();

            cy.url().should('include', '/dev/applications/new');

            cy.get('[value="application"]').check({ force: true });

            cy.get('[name="name"]').type('The Foo');
            cy.get('[name="description"]').type('The Foo Description');
            cy.get('[name="websiteUrl"]').type('https://ely.by');
            cy.get('[name="redirectUri"]').type('https://ely.by/the/redirect/uri');

            cy.get('[type="submit"]').click();

            cy.url().should('include', '/dev/applications#the-foo');

            cy.get('[data-e2e-app-name="The Foo"]').should('exist');

            // test cancel
            cy.contains('Cancel').should('not.exist');
            cy.contains('Revoke all tokens').click();
            cy.contains('Cancel').click();
            cy.contains('Cancel').should('not.exist');

            // test revoke tokens
            cy.contains('Revoke all tokens').click();
            cy.contains('Continue').click();
            cy.wait('@revoke');
            cy.contains('Cancel').should('not.exist');

            // test reset client secret
            cy.findByTestId('client-secret').then(([el]) => {
                const prevSecret = el.value;

                cy.findByTestId('client-secret').should('have.value', prevSecret);
                cy.contains('Reset Client Secret').click();
                cy.contains('Continue').click();
                cy.wait('@revokeSecret');
                cy.contains('Cancel').should('not.exist');
                cy.findByTestId('client-secret').should('not.have.value', prevSecret);
            });

            // test delete
            cy.contains('Delete').click();
            cy.findByTestId('delete-app').click();
            cy.wait('@delete');
            cy.contains("You don't have any app registered yet.").should('be.visible');
        });
    });

    describe('guest', () => {
        it('should render login button', () => {
            cy.visit('/dev/applications');

            cy.get('[data-e2e-content] [href="/login"]').click();

            cy.url().should('include', '/login');
        });

        it('should not allow create new app', () => {
            cy.visit('/dev/applications/new');

            cy.url().should('include', '/login');
        });

        it('should not allow edit app', () => {
            cy.visit('/dev/applications/foo-bar');

            cy.url().should('include', '/login');
        });

        it('should have feedback popup link', () => {
            cy.visit('/dev/applications');

            cy.get('[data-e2e-content] [data-e2e-button="feedbackPopup"]').click();
            cy.findByTestId('feedbackPopup').should('be.visible');
        });
    });
});
