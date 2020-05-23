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

    it('should close password popup if form has errors', () => {
        cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
            cy.server();
            cy.route({
                method: 'POST',
                url: `/api/v1/accounts/${account.id}/password`,
                response: {
                    success: false,
                    errors: {
                        password: 'force popup to be shown',
                    },
                },
            }).as('password');
            cy.visit('/');

            openSectionByName('Password');

            cy.location('pathname').should('eq', '/profile/change-password');

            cy.get('[name=newPassword]').type(account.password);
            // make a mistake to hide confirm popup in future
            cy.get('[name=newRePassword]').type(`${account.password}lol`);
            cy.get('[name=logoutAll]').should('be.checked');
            cy.get('[type=submit]').click();

            // disable response mocks
            cy.route({
                method: 'POST',
                url: `/api/v1/accounts/${account.id}/password`,
            }).as('password');

            confirmWithPassword(account.password);

            cy.findByTestId('password-request-form').should('not.be.visible');
            cy.contains('The passwords does not match').should('be.visible');
        });
    });
});
