import { UserResponse } from 'app/services/api/accounts';

describe('Profile — Restore account', () => {
    it('should restore account', () => {
        cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
            cy.server();
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
                    isDeleted: true, // force deleted state
                    passwordChangedAt: 1476075696,
                    hasMojangUsernameCollision: true,
                    shouldAcceptRules: false,
                } as UserResponse,
            });
            cy.route({
                method: 'POST',
                url: `/api/v1/accounts/${account.id}/restore`,
                response: { success: true },
            }).as('restoreAccount');

            cy.visit('/');

            cy.route({
                method: 'GET',
                url: `/api/v1/accounts/${account.id}`,
                response: {
                    id: 7,
                    uuid: '522e8c19-89d8-4a6d-a2ec-72ebb58c2dbe',
                    username: 'SleepWalker',
                    isOtpEnabled: false,
                    registeredAt: 1475568334,
                    lang: 'en',
                    elyProfileLink: 'http://ely.by/u7',
                    email: 'danilenkos@auroraglobal.com',
                    isActive: true,
                    isDeleted: false, // force deleted state
                    passwordChangedAt: 1476075696,
                    hasMojangUsernameCollision: true,
                    shouldAcceptRules: false,
                } as UserResponse,
            });

            cy.findByTestId('deletedAccount').contains('Restore account').click();

            cy.wait('@restoreAccount');

            cy.location('pathname').should('eq', '/');

            cy.findByTestId('profile-index').should('contain', account.username);
        });
    });
});
