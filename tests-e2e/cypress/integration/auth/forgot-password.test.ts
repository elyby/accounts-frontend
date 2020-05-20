import { account1 } from '../../fixtures/accounts.json';

describe('Forgot / reset password', () => {
  it('should request password reset', () => {
    const captchaCode = 'captchaCode';
    const emailMask = 'fo*@gm*l.**m';

    cy.server();
    cy.route({
      method: 'POST',
      url: '/api/authentication/forgot-password',
      response: {
        success: true,
        data: {
          emailMask,
        },
      },
    }).as('forgot');

    cy.visit('/');

    cy.get('[name=login]').type(`${account1.username}{enter}`);

    cy.location('pathname').should('eq', '/password');

    cy.getByTestId('auth-controls-secondary')
      .contains('Forgot password')
      .click();

    cy.location('pathname').should('eq', '/forgot-password');

    cy.getByTestId('forgot-password-login').should(
      'contain',
      account1.username,
    );

    cy.window().should('have.property', 'e2eCaptchaSetCode');
    cy.window().then((win) => {
      // fake captcha response
      // @ts-ignore
      win.e2eCaptchaSetCode(captchaCode);
    });
    cy.get('[type=submit]').should('have.length', 1).click();

    cy.wait('@forgot')
      .its('requestBody')
      .should(
        'eq',
        new URLSearchParams({
          login: account1.username,
          captcha: captchaCode,
        }).toString(),
      );

    cy.location('pathname').should('eq', '/recover-password');

    cy.getByTestId('auth-body').should('contain', emailMask);
  });

  it('should allow change login', () => {
    const captchaCode = 'captchaCode';
    const login = 'foo';
    const emailMask = 'fo*@gm*l.**m';

    cy.server();
    cy.route({
      method: 'POST',
      url: '/api/authentication/forgot-password',
      response: {
        success: true,
        data: {
          emailMask,
        },
      },
    }).as('forgot');

    cy.visit('/');

    cy.get('[name=login]').type(`${account1.username}{enter}`);

    cy.location('pathname').should('eq', '/password');

    cy.getByTestId('auth-controls-secondary')
      .contains('Forgot password')
      .click();

    cy.location('pathname').should('eq', '/forgot-password');

    cy.getByTestId('edit-login').click();
    cy.get('[name=login]').should('have.value', account1.username);

    cy.get('[name=login]').type(`{selectall}${login}`);
    cy.window().should('have.property', 'e2eCaptchaSetCode');
    cy.window().then((win) => {
      // fake captcha response
      // @ts-ignore
      win.e2eCaptchaSetCode(captchaCode);
    });
    cy.get('[type=submit]').should('have.length', 1).click();

    cy.wait('@forgot')
      .its('requestBody')
      .should(
        'eq',
        new URLSearchParams({
          login,
          captcha: captchaCode,
        }).toString(),
      );

    cy.location('pathname').should('eq', '/recover-password');
  });

  it('should allow enter login', () => {
    const captchaCode = 'captchaCode';
    const login = 'foo';
    const emailMask = 'fo*@gm*l.**m';

    cy.server();
    cy.route({
      method: 'POST',
      url: '/api/authentication/forgot-password',
      response: {
        success: true,
        data: {
          emailMask,
        },
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
    cy.get('[type=submit]').should('have.length', 1).click();

    cy.wait('@forgot')
      .its('requestBody')
      .should(
        'eq',
        new URLSearchParams({
          login,
          captcha: captchaCode,
        }).toString(),
      );

    cy.location('pathname').should('eq', '/recover-password');
  });

  it('should recover password', () => {
    const key = 'key';
    const newPassword = 'newPassword';

    cy.server();
    cy.login({
      accounts: ['default'],
      updateState: false,
      rawApiResp: true,
    }).then(({ accounts: [account] }) => {
      cy.route({
        method: 'POST',
        url: '/api/authentication/recover-password',
        response: account,
      }).as('recover');
    });

    cy.visit('/');

    cy.get('[name=login]').type(`${account1.username}{enter}`);

    cy.location('pathname').should('eq', '/password');

    cy.getByTestId('auth-controls-secondary')
      .contains('Forgot password')
      .click();

    cy.location('pathname').should('eq', '/forgot-password');

    cy.getByTestId('auth-controls-secondary').contains('Already have').click();

    cy.location('pathname').should('eq', '/recover-password');

    cy.getByTestId('auth-controls-secondary')
      .contains('Contact support')
      .click();
    cy.getByTestId('feedbackPopup').should('be.visible');
    cy.getByTestId('feedback-popup-close').click();
    cy.getByTestId('feedbackPopup').should('not.be.visible');

    cy.get('[name=key]').type(key);
    cy.get('[name=newPassword]').type(newPassword);
    cy.get('[name=newRePassword]').type(newPassword);
    cy.get('[type=submit]').should('have.length', 1).click();

    cy.wait('@recover')
      .its('requestBody')
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

    cy.server();
    cy.login({
      accounts: ['default'],
      updateState: false,
      rawApiResp: true,
    }).then(({ accounts: [account] }) => {
      cy.route({
        method: 'POST',
        url: '/api/authentication/recover-password',
        response: account,
      }).as('recover');
    });

    cy.visit('/');

    cy.visit(`/recover-password/${key}`);

    cy.get('[name=key]').should('have.value', key);
    cy.get('[name=key]').should('have.attr', 'readonly');
    cy.get('[name=newPassword]').type(newPassword);
    cy.get('[name=newRePassword]').type(newPassword);
    cy.get('[type=submit]').should('have.length', 1).click();

    cy.wait('@recover')
      .its('requestBody')
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
