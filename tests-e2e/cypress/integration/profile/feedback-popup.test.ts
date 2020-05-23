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

        cy.findByTestId('footer').contains('Contact Us').click();
        cy.findByTestId('feedbackPopup').should('be.visible');

        cy.get('[name=subject]').type(subject);
        cy.get('[name=email]').should('have.value', account1.email);
        cy.get('[name=message]').type(message);

        cy.get('[data-e2e-select-name=category]')
            .findByTestId('select-label')
            .should('contain', 'What are you interested');
        cy.get('[data-e2e-select-name=category]').click();
        cy.get('[data-e2e-select-name=category]').contains('bug').click();
        cy.get('[data-e2e-select-name=category]').findByTestId('select-label').should('contain', 'bug');

        cy.findByTestId('feedbackPopup').get('[type=submit]').click();

        cy.findByTestId('feedbackPopup').should('contain', 'Your message was received');
        cy.findByTestId('feedbackPopup').should('contain', account1.email);

        cy.findByTestId('feedback-popup-close-button').click();

        cy.findByTestId('feedbackPopup').should('not.be.visible');
    });
});
