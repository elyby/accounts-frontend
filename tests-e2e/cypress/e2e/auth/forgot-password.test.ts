import { account1 } from '../../fixtures/accounts.json';

describe('Forgot / reset password', () => {
    it('should request password reset', () => {
        const captchaCode = 'captchaCode';
        const emailMask = 'fo*@gm*l.**m';

        cy.intercept('POST', '/api/authentication/forgot-password', {
            success: true,
            data: {
                emailMask,
            },
        }).as('forgot');

        cy.visit('/');

        cy.get('[name=login]').type(`${account1.username}{enter}`);

        cy.location('pathname').should('eq', '/password');

        cy.findByTestId('auth-controls-secondary').contains('Forgot password').click();

        cy.location('pathname').should('eq', '/forgot-password');

        cy.findByTestId('forgot-password-login').should('contain', account1.username);

        cy.window().should('have.property', 'e2eCaptchaSetCode');
        cy.window().then((win) => {
            // fake captcha response
            // @ts-ignore
            win.e2eCaptchaSetCode(captchaCode);
        });

        cy.get('[type=submit]').click();

        cy.wait('@forgot')
            .its('request.body')
            .should(
                'eq',
                new URLSearchParams({
                    login: account1.username,
                    captcha: captchaCode,
                    captchaType: 'recaptcha',
                }).toString(),
            );

        cy.location('pathname').should('eq', '/recover-password');

        cy.findByTestId('auth-body').should('contain', emailMask);
    });

    it('should allow change login', () => {
        const captchaCode = 'captchaCode';
        const login = 'foo';
        const emailMask = 'fo*@gm*l.**m';

        cy.intercept('POST', '/api/authentication/forgot-password', {
            success: true,
            data: {
                emailMask,
            },
        }).as('forgot');

        cy.visit('/');

        cy.get('[name=login]').type(`${account1.username}{enter}`);

        cy.location('pathname').should('eq', '/password');

        cy.findByTestId('auth-controls-secondary').contains('Forgot password').click();

        cy.location('pathname').should('eq', '/forgot-password');

        cy.findByTestId('edit-login').click();
        cy.get('[name=login]').should('have.value', account1.username);

        cy.get('[name=login]').type(`{selectall}${login}`);
        cy.window().should('have.property', 'e2eCaptchaSetCode');
        cy.window().then((win) => {
            // fake captcha response
            // @ts-ignore
            win.e2eCaptchaSetCode(captchaCode);
        });

        cy.get('[type=submit]').click();

        cy.wait('@forgot')
            .its('request.body')
            .should(
                'eq',
                new URLSearchParams({
                    login,
                    captcha: captchaCode,
                    captchaType: 'recaptcha',
                }).toString(),
            );

        cy.location('pathname').should('eq', '/recover-password');
    });

    it('should allow enter login', () => {
        const captchaCode = 'captchaCode';
        const login = 'foo';
        const emailMask = 'fo*@gm*l.**m';

        cy.intercept('POST', '/api/authentication/forgot-password', {
            success: true,
            data: {
                emailMask,
            },
        }).as('forgot');

        cy.visit('/forgot-password');

        cy.get('[name=login]').type(login);
        cy.window().should('have.property', 'e2eCaptchaSetCode');
        cy.window().then((win) => {
            // fake captcha response
            // @ts-ignore
            win.e2eCaptchaSetCode(captchaCode);
        });
        cy.get('[type=submit]').click();

        cy.wait('@forgot')
            .its('request.body')
            .should(
                'eq',
                new URLSearchParams({
                    login,
                    captcha: captchaCode,
                    captchaType: 'recaptcha',
                }).toString(),
            );

        cy.location('pathname').should('eq', '/recover-password');
    });

    it('should recover password', () => {
        const key = 'key';
        const newPassword = 'newPassword';

        cy.login({
            accounts: ['default'],
            updateState: false,
            rawApiResp: true,
        }).then(({ accounts: [account] }) => {
            cy.intercept('POST', '/api/authentication/recover-password', account).as('recover');
        });

        cy.visit('/');

        cy.get('[name=login]').type(`${account1.username}{enter}`);

        cy.location('pathname').should('eq', '/password');

        cy.findByTestId('auth-controls-secondary').contains('Forgot password').click();

        cy.location('pathname').should('eq', '/forgot-password');

        cy.findByTestId('auth-controls-secondary').contains('Already have').click();

        cy.location('pathname').should('eq', '/recover-password');

        cy.findByTestId('auth-controls-secondary').contains('Contact support').click();
        cy.findByTestId('feedbackPopup').should('be.visible');
        cy.findByTestId('feedbackPopup').findByTestId('popup-close').click();
        cy.findByTestId('feedbackPopup').should('not.be.visible');

        cy.get('[name=key]').type(key);
        cy.get('[name=newPassword]').type(newPassword);
        cy.get('[name=newRePassword]').type(newPassword);
        cy.get('[type=submit]').click();

        cy.wait('@recover')
            .its('request.body')
            .should(
                'eq',
                new URLSearchParams({
                    key,
                    newPassword,
                    newRePassword: newPassword,
                }).toString(),
            );
    });

    it('should read key from an url', () => {
        const key = 'key';
        const newPassword = 'newPassword';

        cy.login({
            accounts: ['default'],
            updateState: false,
            rawApiResp: true,
        }).then(({ accounts: [account] }) => {
            cy.intercept('POST', '/api/authentication/recover-password', account).as('recover');
        });

        cy.visit('/');

        cy.visit(`/recover-password/${key}`);

        cy.get('[name=key]').should('have.value', key);
        cy.get('[name=key]').should('have.attr', 'readonly');
        cy.get('[name=newPassword]').type(newPassword);
        cy.get('[name=newRePassword]').type(newPassword);
        cy.get('[type=submit]').click();

        cy.wait('@recover')
            .its('request.body')
            .should(
                'eq',
                new URLSearchParams({
                    key,
                    newPassword,
                    newRePassword: newPassword,
                }).toString(),
            );
    });
});
