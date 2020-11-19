import { account1, account2 } from '../../fixtures/accounts.json';
import { UserResponse } from 'app/services/api/accounts';
import { confirmWithPassword } from '../profile/utils';

describe('Sign in / Log out', () => {
    it('should sign in', () => {
        cy.visit('/');

        cy.url().should('include', '/login');

        cy.get('[name=login]').type(`${account1.login}{enter}`);

        cy.url().should('include', '/password');

        cy.get('[name=password]').type(account1.password);
        cy.get('[name=rememberMe]').should('be.checked');
        cy.get('[type=submit]').click();

        cy.location('pathname').should('eq', '/');

        cy.findByTestId('toolbar')
            .contains(account1.username)
            .should(() => {
                const state = JSON.parse(localStorage.getItem('redux-storage') || '');
                expect(state.accounts.available).to.have.length(1);

                const [account] = state.accounts.available;
                expect(account.username).to.be.equal(account1.username);
                expect(account.id).to.be.a('number').and.to.be.gt(0);
                expect(account.email).to.be.a('string').and.have.length.gt(0);
                expect(account.token).to.be.a('string').and.have.length.gt(0);
                expect(account.refreshToken).to.be.a('string').and.have.length.gt(0);

                expect(state.accounts.active).to.be.equal(account.id);

                const { user } = state;
                expect(user.id).to.be.equal(account.id);
                expect(user.username).to.be.equal(account.username);
                expect(user.isGuest).to.be.false;
            });
    });

    it('should force to /login page', () => {
        cy.visit('/');

        cy.location('pathname').should('eq', '/login');

        cy.findByTestId('home-page').click();

        cy.location('pathname').should('eq', '/login');
    });

    it('should sign in without remember me', () => {
        cy.visit('/');

        cy.get('[name=login]').type(`${account1.login}{enter}`);

        cy.url().should('include', '/password');

        cy.get('[name=password]').type(account1.password);
        cy.get('[name=rememberMe]').parent().click();
        cy.get('[name=rememberMe]').should('not.be.checked');
        cy.get('[type=submit]').click();

        cy.location('pathname').should('eq', '/');

        cy.findByTestId('toolbar')
            .contains(account1.username)
            .should(() => {
                const state = JSON.parse(localStorage.getItem('redux-storage') || '');
                expect(state.accounts.available).to.have.length(1);

                const [account] = state.accounts.available;
                expect(account.username).to.be.equal(account1.username);
                expect(account.id).to.be.a('number').and.to.be.gt(0);
                expect(account.email).to.be.a('string').and.have.length.gt(0);
                expect(account.token).to.be.a('string').and.have.length.gt(0);
                expect(account.refreshToken).eql(null);

                expect(state.accounts.active).to.be.equal(account.id);

                const { user } = state;
                expect(user.id).to.be.equal(account.id);
                expect(user.username).to.be.equal(account.username);
                expect(user.isGuest).to.be.false;
            });
    });

    it('should sign in with totp', () => {
        cy.visit('/');

        cy.get('[name=login]').type(`${account1.login}{enter}`);

        cy.url().should('include', '/password');

        cy.server();
        cy.route({
            method: 'POST',
            url: '/api/authentication/login',
            response: {
                success: false,
                errors: { totp: 'error.totp_required' },
            },
        });

        cy.get('[name=password]').type(account1.password);
        cy.get('[type=submit]').click();

        cy.url().should('include', '/mfa');

        cy.route({
            method: 'POST',
            url: '/api/authentication/login',
        }).as('login');

        cy.get('[name=totp]').type('123{enter}');

        cy.wait('@login').its('requestBody').should('include', 'totp=123');

        cy.location('pathname').should('eq', '/');
    });

    it('should allow logout', () => {
        cy.login({ accounts: ['default'] });

        cy.visit('/');

        cy.findByTestId('toolbar').contains(account1.username).click();

        cy.findByTestId('active-account').findByTestId('logout-account').click();

        cy.location('pathname').should('eq', '/login');
        cy.findByTestId('toolbar').should('contain', 'Join');
    });

    it("should prompt for user agreement when the project's rules are changed", () => {
        cy.visit('/');

        cy.get('[name=login]').type(`${account1.login}{enter}`);

        cy.url().should('include', '/password');

        cy.get('[name=password]').type(account1.password);
        cy.get('[name=rememberMe]').should('be.checked');

        cy.server();
        cy.route({
            method: 'POST',
            url: `/api/v1/accounts/${account1.id}/rules`,
        }).as('rulesAgreement');
        cy.route({
            method: 'GET',
            url: `/api/v1/accounts/${account1.id}`,
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
                isDeleted: false,
                passwordChangedAt: 1476075696,
                hasMojangUsernameCollision: true,
                shouldAcceptRules: true, // force user to accept updated user agreement
            } as UserResponse,
        });

        cy.get('[type=submit]').click();

        cy.location('pathname').should('eq', '/accept-rules');

        cy.get('[type=submit]').last().click(); // add .last() to match the new state during its transition
        cy.wait('@rulesAgreement').its('requestBody').should('be.empty');

        cy.location('pathname').should('eq', '/');
        cy.findByTestId('profile-index').should('contain', account1.username);
    });

    it('should allow logout from the user agreement prompt', () => {
        cy.visit('/');

        cy.get('[name=login]').type(`${account1.login}{enter}`);

        cy.url().should('include', '/password');

        cy.get('[name=password]').type(account1.password);
        cy.get('[name=rememberMe]').should('be.checked');

        cy.server();
        cy.route({
            method: 'GET',
            url: `/api/v1/accounts/${account1.id}`,
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
                isDeleted: false,
                passwordChangedAt: 1476075696,
                hasMojangUsernameCollision: true,
                shouldAcceptRules: true, // force user to accept updated user agreement
            } as UserResponse,
        });

        cy.get('[type=submit]').click();

        cy.location('pathname').should('eq', '/accept-rules');

        cy.findByText('Decline and logout').click();

        cy.location('pathname').should('eq', '/login');
        cy.findByTestId('toolbar').should('contain', 'Join');
    });

    it('should allow user to delete its own account from the user agreement prompt', () => {
        cy.visit('/');

        cy.get('[name=login]').type(`${account1.login}{enter}`);

        cy.url().should('include', '/password');

        cy.get('[name=password]').type(account1.password);
        cy.get('[name=rememberMe]').should('be.checked');

        cy.server();
        cy.route({
            method: 'GET',
            url: `/api/v1/accounts/${account1.id}`,
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
                isDeleted: false,
                passwordChangedAt: 1476075696,
                hasMojangUsernameCollision: true,
                shouldAcceptRules: true, // force user to accept updated user agreement
            } as UserResponse,
        });

        cy.get('[type=submit]').click();

        cy.location('pathname').should('eq', '/accept-rules');

        cy.findByText('Delete account').click();

        cy.location('pathname').should('eq', '/profile/delete');

        cy.route({
            method: 'DELETE',
            url: `/api/v1/accounts/${account1.id}`,
        }).as('deleteAccount');
        cy.route({
            method: 'GET',
            url: `/api/v1/accounts/${account1.id}`,
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
                isDeleted: true, // mock deleted state since the delete will not perform the real request
                passwordChangedAt: 1476075696,
                hasMojangUsernameCollision: true,
                shouldAcceptRules: true, // rules still aren't accepted
            } as UserResponse,
        });

        cy.get('[type=submit]').click();

        cy.wait('@deleteAccount')
            .its('requestBody')
            .should(
                'eq',
                new URLSearchParams({
                    password: '',
                }).toString(),
            );

        cy.route({
            method: 'DELETE',
            url: `/api/v1/accounts/${account1.id}`,
            response: { success: true },
        }).as('deleteAccount');

        confirmWithPassword(account1.password);

        cy.wait('@deleteAccount')
            .its('requestBody')
            .should(
                'eq',
                new URLSearchParams({
                    password: account1.password,
                }).toString(),
            );

        cy.location('pathname').should('eq', '/');

        cy.findByTestId('deletedAccount').should('contain', 'Account is deleted');
    });

    describe('multi account', () => {
        it('should allow sign in with another account', () => {
            cy.login({ accounts: ['default2'] });

            cy.visit('/');

            cy.findByTestId('toolbar').contains(account2.username).click();

            cy.findByTestId('active-account').should('have.length', 1);
            cy.get('[data-e2e-account-id]').should('have.length', 0);

            cy.findByTestId('add-account').click();

            cy.location('pathname').should('eq', '/login');

            cy.get('[data-e2e-go-back]').should('exist');

            cy.get('[name=login]').type(`${account1.login}{enter}`);

            cy.url().should('include', '/password');

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            cy.location('pathname').should('eq', '/');

            cy.findByTestId('toolbar').contains(account1.username).click();

            cy.findByTestId('active-account').should('have.length', 1);
            cy.get('[data-e2e-account-id]').should('have.length', 1);

            cy.get('[data-e2e-account-id]').findByTestId('logout-account').click();
        });

        it('should go back to profile from login screen', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/');

            cy.findByTestId('toolbar').contains(account1.username).click();

            cy.findByTestId('add-account').click();

            cy.location('pathname').should('eq', '/login');

            cy.get('[data-e2e-go-back]').click();

            cy.location('pathname').should('eq', '/');
        });

        it('should allow logout active account', () => {
            cy.login({ accounts: ['default', 'default2'] });

            cy.visit('/');

            cy.findByTestId('toolbar').contains(account1.username).click();

            cy.findByTestId('active-account').findByTestId('logout-account').click();

            cy.findByTestId('toolbar').contains(account2.username).click();
            cy.get('[data-e2e-account-id]').should('have.length', 0);
            cy.findByTestId('profile-index').should('not.contain', account1.username);
            cy.findByTestId('profile-index').should('contain', account2.username);
        });

        it('should not allow log in the same account twice', () => {
            cy.login({ accounts: ['default'] });

            cy.visit('/');

            cy.findByTestId('toolbar').contains(account1.username).click();

            cy.findByTestId('active-account').should('have.length', 1);
            cy.get('[data-e2e-account-id]').should('have.length', 0);

            cy.findByTestId('add-account').click();

            cy.location('pathname').should('eq', '/login');

            cy.get('[data-e2e-go-back]').should('exist');

            cy.get('[name=login]').type(`${account1.login}{enter}`);

            cy.url().should('include', '/password');

            cy.get('[name=password]').type(`${account1.password}{enter}`);

            cy.location('pathname').should('eq', '/');

            cy.findByTestId('toolbar').contains(account1.username).click();
            cy.get('[data-e2e-account-id]').should('have.length', 0);
        });
    });
});
