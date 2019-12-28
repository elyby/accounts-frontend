import { account1 } from '../../fixtures/accounts.json';

describe('feedback popup', () => {
  it('should send feedback', () => {
    const subject = 'Hello world';
    const message = 'This is a feedback message';

    cy.server();
    cy.route({
      url: '/api/feedback',
      method: 'POST',
      response: { success: true },
    });

    cy.login({ accounts: ['default'] });

    cy.visit('/');

    cy.getByTestId('footer')
      .contains('Contact Us')
      .click();
    cy.getByTestId('feedbackPopup').should('be.visible');

    cy.get('[name=subject]').type(subject);
    cy.get('[name=email]').should('have.value', account1.email);
    cy.get('[name=message]').type(message);

    cy.get('[data-e2e-select-name=category]')
      .getByTestId('select-label')
      .should('contain', 'What are you interested');
    cy.get('[data-e2e-select-name=category]').click();
    cy.get('[data-e2e-select-name=category]')
      .contains('bug')
      .click();
    cy.get('[data-e2e-select-name=category]')
      .getByTestId('select-label')
      .should('contain', 'bug');

    cy.getByTestId('feedbackPopup')
      .get('[type=submit]')
      .click();

    cy.getByTestId('feedbackPopup').should(
      'contain',
      'Your message was received',
    );
    cy.getByTestId('feedbackPopup').should('contain', account1.email);

    cy.getByTestId('feedback-popup-close-button').click();

    cy.getByTestId('feedbackPopup').should('not.be.visible');
  });
});
