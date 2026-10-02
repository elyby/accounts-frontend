import { UserResponse } from 'app/services/api/accounts';

import { openSectionByName, getSectionByName, confirmWithPassword } from './utils';

describe('Profile — mfa', () => {
    it('should enable mfa', () => {
        const totp = 'totp123';

        cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
            cy.intercept('POST', `/api/v1/accounts/${account.id}/two-factor-auth`, {
                success: false,
                errors: { password: 'foo' },
            }).as('mfaSaved');

            cy.visit('/');

            getSectionByName('Two‑factor auth').should('contain', 'Disabled');
            openSectionByName('Two‑factor auth');

            cy.location('pathname').should('eq', '/profile/mfa');

            assertOs('Google Play', 'android');
            assertOs('App Store', 'ios');
            assertOs('Windows Store', 'windows');

            cy.contains('App has been installed').click();

            cy.location('pathname').should('eq', '/profile/mfa/step2');

            cy.findByTestId('secret').should('not.be.empty');

            cy.contains('Ready').click();

            cy.location('pathname').should('eq', '/profile/mfa/step3');

            cy.get('[name=totp]').type(`${totp}{enter}`);

            cy.wait('@mfaSaved')
                .its('request.body')
                .should(
                    'eq',
                    new URLSearchParams({
                        totp,
                        password: '',
                    }).toString(),
                );

            cy.intercept('POST', `/api/v1/accounts/${account.id}/two-factor-auth`, { success: true }).as(
                'mfaSaved',
            );
            cy.intercept('GET', `/api/v1/accounts/${account.id}`, {
                id: 7,
                uuid: '522e8c19-89d8-4a6d-a2ec-72ebb58c2dbe',
                username: 'SleepWalker',
                isOtpEnabled: true, // fake enabled mfa
                registeredAt: 1475568334,
                lang: 'en',
                elyProfileLink: 'http://ely.by/u7',
                email: 'danilenkos@auroraglobal.com',
                isActive: true,
                isDeleted: false,
                passwordChangedAt: 1476075696,
                hasMojangUsernameCollision: true,
                shouldAcceptRules: false,
            } as UserResponse);

            confirmWithPassword(account.password);

            cy.wait('@mfaSaved')
                .its('request.body')
                .should(
                    'eq',
                    new URLSearchParams({
                        totp,
                        password: account.password,
                    }).toString(),
                );

            cy.location('pathname').should('eq', '/');
            getSectionByName('Two‑factor auth').should('contain', 'Enabled');
        });
    });

    it('should disable mfa', () => {
        const totp = 'totp123';

        cy.login({ accounts: ['default'] }).then(({ accounts: [account] }) => {
            cy.intercept('GET', `/api/v1/accounts/${account.id}`, {
                id: 7,
                uuid: '522e8c19-89d8-4a6d-a2ec-72ebb58c2dbe',
                username: 'SleepWalker',
                isOtpEnabled: true, // fake enabled mfa
                registeredAt: 1475568334,
                lang: 'en',
                elyProfileLink: 'http://ely.by/u7',
                email: 'danilenkos@auroraglobal.com',
                isActive: true,
                isDeleted: false,
                passwordChangedAt: 1476075696,
                hasMojangUsernameCollision: true,
                shouldAcceptRules: false,
            } as UserResponse);
            cy.intercept('DELETE', `/api/v1/accounts/${account.id}/two-factor-auth`, {
                success: false,
                errors: { password: 'foo' },
            }).as('mfaSaved');

            cy.visit('/');

            getSectionByName('Two‑factor auth').should('contain', 'Enabled');
            openSectionByName('Two‑factor auth');

            cy.location('pathname').should('eq', '/profile/mfa');

            cy.contains('Disable').click();

            cy.get('[name=totp]').type(`${totp}{enter}`);

            cy.wait('@mfaSaved')
                .its('request.body')
                .should(
                    'eq',
                    new URLSearchParams({
                        totp,
                        password: '',
                    }).toString(),
                );

            cy.intercept('DELETE', `/api/v1/accounts/${account.id}/two-factor-auth`, { success: true }).as(
                'mfaSaved',
            );
            // unmock accounts route
            cy.intercept('GET', `/api/v1/accounts/${account.id}`, (req) => req.continue());

            confirmWithPassword(account.password);

            cy.wait('@mfaSaved')
                .its('request.body')
                .should(
                    'eq',
                    new URLSearchParams({
                        totp,
                        password: account.password,
                    }).toString(),
                );

            cy.location('pathname').should('eq', '/');
            getSectionByName('Two‑factor auth').should('contain', 'Disabled');
        });
    });
});

function assertOs(name: string, os: string) {
    cy.findAllByTestId('os-tile').contains(name).click();

    cy.findByTestId('os-instruction').should('have.attr', 'data-os', os);

    cy.findAllByTestId('os-tile').contains(name).click();
}
