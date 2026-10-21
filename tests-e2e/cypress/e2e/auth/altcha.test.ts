import { account1 } from '../../fixtures/accounts.json';
// The challenge, signed with the secrets of the backend's AltchaTest.php: cost 10, counter 50, counterMax 100,
// expires in 2100. Cheap enough to be solved by the real solver in the browser
import challenge from '../../fixtures/altchaChallenge.json';

const CHALLENGE_URL = '/api/captcha/altcha/challenge';

// The derived key for the counter 50 (see the fixture)
const EXPECTED_SOLUTION = {
    counter: 50,
    derivedKey: '5b8f3627d377b1a63e3b5741c27a05dce52e56caadd10559909dbf93a0ab6601',
};

/**
 * Forces the app to use ALTCHA regardless of the backend's configuration
 */
function givenAltchaEnabled() {
    cy.intercept('GET', '/api/options', {
        captcha: {
            altcha: { challengeUrl: CHALLENGE_URL },
        },
    }).as('options');
}

function givenChallenge() {
    cy.intercept('GET', CHALLENGE_URL, challenge).as('challenge');
}

function decodePayload(token: string) {
    return JSON.parse(atob(token));
}

function getAltcha() {
    return cy.findByTestId('altcha');
}

function solveAltcha() {
    getAltcha().should('have.attr', 'data-state', 'idle');
    getAltcha().contains('I’m not a creeper').click();
    cy.wait('@challenge');
    // The challenge is solved by the real solver in Web Workers. The solving itself is instant, but the workers'
    // scripts are loaded through the Cypress's proxy, where they sometimes wait for a free connection for seconds
    cy.findByTestId('altcha', { timeout: 15_000 }).should('have.attr', 'data-state', 'verified');
    getAltcha().find('[type=checkbox]').should('be.checked');
}

describe('ALTCHA captcha', () => {
    beforeEach(() => {
        givenAltchaEnabled();
    });

    it('should solve the challenge and send the payload on registration', () => {
        const username = `test${Date.now()}`;
        const email = `${Date.now()}@gmail.com`;
        const password = String(Date.now());

        givenChallenge();
        cy.intercept('POST', '/api/signup', { success: true }).as('signup');
        cy.visit('/register');

        cy.get('[name=username]').type(username);
        cy.get('[name=email]').type(email);
        cy.get('[name=password]').type(password);
        cy.get('[name=rePassword]').type(password);
        cy.get('[name=rulesAgreement]').parent().click();

        solveAltcha();

        cy.get('[type=submit]').click();

        cy.wait('@signup')
            .its('request.body')
            .then((body: string) => {
                const params = new URLSearchParams(body);

                expect(params.get('captchaType')).to.eq('altcha');
                expect(decodePayload(params.get('captcha')!)).to.deep.include({ challenge });
                expect(decodePayload(params.get('captcha')!).solution).to.include(EXPECTED_SOLUTION);
            });

        cy.location('pathname').should('eq', '/activation');
    });

    it('should send the payload on password recovery', () => {
        givenChallenge();
        cy.intercept('POST', '/api/authentication/forgot-password', {
            success: true,
            data: { emailMask: 'p**@gmail.com' },
        }).as('forgotPassword');
        cy.visit('/');

        cy.get('[name=login]').type(`${account1.username}{enter}`);
        cy.location('pathname').should('eq', '/password');
        cy.findByTestId('auth-controls-secondary').contains('Forgot password').click();
        cy.location('pathname').should('eq', '/forgot-password');

        solveAltcha();

        cy.get('[type=submit]').click();

        cy.wait('@forgotPassword')
            .its('request.body')
            .then((body: string) => {
                const params = new URLSearchParams(body);

                expect(params.get('captchaType')).to.eq('altcha');
                expect(decodePayload(params.get('captcha')!).solution).to.include(EXPECTED_SOLUTION);
            });
    });

    it('should allow to retry when the challenge cannot be loaded', () => {
        cy.intercept(
            { method: 'GET', url: CHALLENGE_URL, times: 1 },
            { statusCode: 429, body: { name: 'Too Many Requests' } },
        ).as('challengeFailed');
        cy.visit('/resend-activation');

        getAltcha().contains('I’m not a creeper').click();
        cy.wait('@challengeFailed');

        getAltcha().should('have.attr', 'data-state', 'error');
        getAltcha().contains('Verification failed').should('be.visible');
        getAltcha().find('[type=checkbox]').should('not.be.checked');

        givenChallenge();
        getAltcha().contains('Verification failed').click();
        cy.wait('@challenge');

        getAltcha().should('have.attr', 'data-state', 'verified');
    });

    it('should require a new solution after the backend rejected the form', () => {
        const email = `${Date.now()}@gmail.com`;

        givenChallenge();
        cy.intercept('POST', '/api/signup/repeat-message', {
            statusCode: 200,
            body: { success: false, errors: { captcha: 'error.captcha_invalid' } },
        }).as('resend');
        cy.visit('/resend-activation');

        cy.get('[name=email]').type(email);

        solveAltcha();

        cy.get('[type=submit]').click();
        cy.wait('@resend');

        // Tokens are single-use: the widget must be reset, so the user solves a new challenge
        getAltcha().should('have.attr', 'data-state', 'idle');
        getAltcha().find('[type=checkbox]').should('not.be.checked');
    });
});
