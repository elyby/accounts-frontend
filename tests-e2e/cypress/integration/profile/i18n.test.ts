describe('Change locale', () => {
    it('should change locale from the footer', () => {
        cy.visit('/');

        cy.findByTestId('footer').contains('Site language').click();

        cy.findByTestId('language-switcher').should('be.visible');
        cy.findByTestId('language-switcher').should('have.attr', 'data-e2e-active-locale', 'en');

        cy.findByTestId('languages-list-item').contains('Belarusian').click();

        cy.findByTestId('language-switcher').should('not.be.visible');

        cy.findByTestId('footer').contains('Мова сайта').click();

        cy.findByTestId('language-switcher').should('be.visible');
        cy.findByTestId('language-switcher').should('have.attr', 'data-e2e-active-locale', 'be');

        cy.findByTestId('languages-list-item').contains('English').click();

        cy.findByTestId('language-switcher').should('not.be.visible');
        cy.findByTestId('footer').should('contain', 'Site language');
    });

    it('should change locale from the profile', () => {
        cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
            cy.server();
            cy.route({
                method: 'POST',
                url: `/api/v1/accounts/${account.id}/language`,
                response: { success: true },
            }).as('language');
        });

        cy.visit('/');

        cy.findByTestId('profile-index').contains('English').click();

        cy.findByTestId('language-switcher').should('be.visible');
        cy.findByTestId('language-switcher').should('have.attr', 'data-e2e-active-locale', 'en');

        cy.findByTestId('languages-list-item').contains('Belarusian').click();

        cy.wait('@language').its('requestBody').should('eq', 'lang=be');

        cy.findByTestId('language-switcher').should('not.be.visible');
        cy.findByTestId('profile-index').should('contain', 'Беларуская');
    });
});
