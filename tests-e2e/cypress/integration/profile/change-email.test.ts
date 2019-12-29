import { openSectionByName, confirmWithPassword } from './utils';

describe('Profile — Change Email', () => {
  it('should change email', () => {
    const key = 'key123';
    const key2 = 'key1232';

    cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
      cy.server();
      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/email-verification`,
      }).as('requestEmailChange');
      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/new-email-verification`,
        response: { success: true },
      }).as('verifyNewEmail');
      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/email`,
        response: { success: true },
      }).as('saveEmail');

      cy.visit('/');

      openSectionByName('E‑mail');

      cy.location('pathname').should('eq', '/profile/change-email');

      cy.contains('Send E‑mail').click();

      cy.wait('@requestEmailChange')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            password: '',
          }).toString(),
        );

      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/email-verification`,
        response: { success: true },
      }).as('requestEmailChange');

      confirmWithPassword(account.password);

      cy.wait('@requestEmailChange')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            password: account.password,
          }).toString(),
        );

      cy.location('pathname').should('eq', '/profile/change-email/step2');

      cy.getByTestId('step2')
        .find('[name=key]')
        .type(key);
      cy.getByTestId('step2')
        .find('[name=email]')
        .type(`${account.email}{enter}`);

      cy.wait('@verifyNewEmail')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            email: account.email,
            key,
          }).toString(),
        );
      cy.location('pathname').should('eq', '/profile/change-email/step3');

      cy.getByTestId('step3')
        .find('[name=key]')
        .should('have.value', '');
      cy.getByTestId('step3')
        .find('[name=key]')
        .type(`${key2}{enter}`);

      cy.wait('@saveEmail')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            key: key2,
          }).toString(),
        );
      cy.location('pathname').should('eq', '/');
    });
  });

  it('should allow to skip steps', () => {
    cy.login({ accounts: ['default'] });

    cy.visit('/profile/change-email');

    cy.contains('Already received code').click();

    cy.visit('/profile/change-email/step2');

    cy.contains('Already received code').click();

    cy.visit('/profile/change-email/step3');
  });

  it('should read code from url on step2', () => {
    const key = 'key123';

    cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
      cy.server();
      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/new-email-verification`,
        response: { success: true },
      }).as('verifyNewEmail');

      cy.visit(`/profile/change-email/step2/${key}`);

      cy.getByTestId('step2')
        .find('[name=key]')
        .should('have.value', key);
      cy.getByTestId('step2')
        .find('[name=key]')
        .should('be.disabled');
      cy.getByTestId('step2')
        .find('[name=email]')
        .type(`${account.email}{enter}`);

      cy.wait('@verifyNewEmail')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            email: account.email,
            key,
          }).toString(),
        );
      cy.location('pathname').should('eq', '/profile/change-email/step3');
      cy.getByTestId('step3')
        .find('[name=key]')
        .should('have.value', '');
    });
  });

  it('should read code from url on step3', () => {
    const key = 'key123';

    cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
      cy.server();
      cy.route({
        method: 'POST',
        url: `/api/v1/accounts/${account.id}/email`,
        response: { success: true },
      }).as('saveEmail');

      cy.visit(`/profile/change-email/step3/${key}`);

      cy.getByTestId('step3')
        .find('[name=key]')
        .should('have.value', key);
      cy.getByTestId('step3')
        .find('[name=key]')
        .should('be.disabled');

      cy.getByTestId('change-email')
        .find('[type=submit]')
        .click();

      cy.wait('@saveEmail')
        .its('requestBody')
        .should(
          'eq',
          new URLSearchParams({
            key,
          }).toString(),
        );
      cy.location('pathname').should('eq', '/');
    });
  });
});
