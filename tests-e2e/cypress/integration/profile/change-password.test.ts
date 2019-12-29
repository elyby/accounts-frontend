import { openSectionByName, confirmWithPassword } from './utils';

describe('Profile — Change password', () => {
  it('should change password', () => {
    cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
      cy.server();
      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/password`,
      }).as('password');
      cy.visit('/');

      openSectionByName('Password');

      cy.location('pathname').should('eq', '/profile/change-password');

      cy.get('[name=newPassword]').type(account.password);
      cy.get('[name=newRePassword]').type(account.password);
      cy.get('[name=logoutAll]').should('be.checked');
      cy.get('[type=submit]').click();

      cy.wait('@password')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            password: '',
            newPassword: account.password,
            newRePassword: account.password,
            logoutAll: '1',
          }).toString(),
        );

      confirmWithPassword(account.password);

      cy.wait('@password')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            password: account.password,
            newPassword: account.password,
            newRePassword: account.password,
            logoutAll: '1',
          }).toString(),
        );

      cy.location('pathname').should('eq', '/');
    });
  });
});
