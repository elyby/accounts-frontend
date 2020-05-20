import { openSectionByName, confirmWithPassword } from './utils';

describe('Profile — Change Username', () => {
  it('should change username', () => {
    cy.server();

    cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
      cy.route({
        method: 'GET',
        url: `/api/v1/accounts/${account.id}`,
        response: {
          id: 7,
          uuid: '522e8c19-89d8-4a6d-a2ec-72ebb58c2dbe',
          username: 'FooBar',
          isOtpEnabled: false,
          registeredAt: 1475568334,
          lang: 'en',
          elyProfileLink: 'http://ely.by/u7',
          email: 'danilenkos@auroraglobal.com',
          isActive: true,
          passwordChangedAt: 1476075696,
          hasMojangUsernameCollision: true,
          shouldAcceptRules: false,
        },
      });

      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/username`,
      }).as('username');

      cy.visit('/');

      openSectionByName('Nickname');

      cy.location('pathname').should('eq', '/profile/change-username');

      cy.get('[name=username]').type(`{selectall}${account.username}{enter}`);

      // unmock accounts route
      cy.route({
        method: 'GET',
        url: `/api/v1/accounts/${account.id}`,
      });

      cy.wait('@username')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            username: account.username,
            password: '',
          }).toString(),
        );

      confirmWithPassword(account.password);

      cy.wait('@username')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            username: account.username,
            password: account.password,
          }).toString(),
        );

      cy.location('pathname').should('eq', '/');
      cy.getByTestId('profile-item').should('contain', account.username);
      cy.getByTestId('toolbar').contains(account.username).click();
      cy.getByTestId('active-account').should('contain', account.username);
    });
  });

  it('should go back to profile', () => {
    cy.login({ accounts: ['default'] });

    cy.visit('/profile/change-username');

    cy.getByTestId('back-to-profile').click();

    cy.location('pathname').should('eq', '/');
  });
});
