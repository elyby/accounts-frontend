describe('Change locale', () => {
  it('should change locale from footer', () => {
    cy.visit('/');

    cy.getByTestId('footer').contains('Site language').click();

    cy.getByTestId('language-switcher').should('be.visible');
    cy.getByTestId('language-switcher').should(
      'have.attr',
      'data-e2e-active-locale',
      'en',
    );

    cy.getByTestId('language-list').contains('Belarusian').click();

    cy.getByTestId('language-switcher').should('not.be.visible');

    cy.getByTestId('footer').contains('Мова сайта').click();

    cy.getByTestId('language-switcher').should('be.visible');
    cy.getByTestId('language-switcher').should(
      'have.attr',
      'data-e2e-active-locale',
      'be',
    );

    cy.getByTestId('language-list').contains('English').click();

    cy.getByTestId('language-switcher').should('not.be.visible');
    cy.getByTestId('footer').should('contain', 'Site language');
  });

  it('should change locale from profile', () => {
    cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
      cy.server();
      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/language`,
        response: { success: true },
      }).as('language');
    });

    cy.visit('/');

    cy.getByTestId('profile-index').contains('English').click();

    cy.getByTestId('language-switcher').should('be.visible');
    cy.getByTestId('language-switcher').should(
      'have.attr',
      'data-e2e-active-locale',
      'en',
    );

    cy.getByTestId('language-list').contains('Belarusian').click();

    cy.wait('@language').its('requestBody').should('eq', 'lang=be');

    cy.getByTestId('language-switcher').should('not.be.visible');
    cy.getByTestId('profile-index').should('contain', 'Беларуская');
  });
});
