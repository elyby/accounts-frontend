import { openSectionByName, confirmWithPassword } from './utils';
import { UserResponse } from 'app/services/api/accounts';

describe('Profile — Delete account', () => {
    it('should delete account', () => {
        cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
            cy.intercept('DELETE', `/api/v1/accounts/${account.id}`).as('deleteAccount');
            cy.intercept('GET', `/api/v1/accounts/${account.id}`);

            cy.visit('/');

            openSectionByName('Account deletion');

            cy.location('pathname').should('eq', '/profile/delete');

            cy.get('[type=submit]').click();

            cy.wait('@deleteAccount')
                .its('request.body')
                .should(
                    'eq',
                    new URLSearchParams({
                        password: '',
                    }).toString(),
                );

            cy.intercept('DELETE', `/api/v1/accounts/${account.id}`, { success: true }).as('deleteAccount');
            cy.intercept('GET', `/api/v1/accounts/${account.id}`, {
                id: 7,
                uuid: '522e8c19-89d8-4a6d-a2ec-72ebb58c2dbe',
                username: 'SleepWalker',
                isOtpEnabled: false,
                registeredAt: 1475568334,
                lang: 'en',
                elyProfileLink: 'http://ely.by/u7',
                email: 'danilenkos@auroraglobal.com',
                isActive: true,
                isDeleted: true, // mock deleted state since the delete will not perform the real request
                passwordChangedAt: 1476075696,
                hasMojangUsernameCollision: true,
                shouldAcceptRules: false,
            } as UserResponse);

            confirmWithPassword(account.password);

            cy.wait('@deleteAccount')
                .its('request.body')
                .should(
                    'eq',
                    new URLSearchParams({
                        password: account.password,
                    }).toString(),
                );

            cy.location('pathname').should('eq', '/');

            cy.findByTestId('deletedAccount').should('contain', 'Account is deleted');
        });
    });
});
