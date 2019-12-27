it('should register', () => {
  const username = `test${Date.now()}`;
  const email = `${Date.now()}@gmail.com`;
  const password = String(Date.now());
  const captchaCode = 'captchaCode';
  const activationKey = 'activationKey';

  cy.server();
  cy.route({
    method: 'POST',
    url: '/api/signup',
    response: {
      success: true,
    },
  }).as('signup');
  cy.login({
    accounts: ['default'],
    updateState: false,
    rawApiResp: true,
  }).then(({ accounts: [account] }) => {
    cy.route({
      method: 'POST',
      url: '/api/signup/confirm',
      response: account,
    }).as('activate');
  });
  cy.visit('/');

  cy.getByTestId('toolbar')
    .contains('Join')
    .click();

  cy.location('pathname').should('eq', '/register');

  cy.get('[name=username]').type(username);
  cy.get('[name=email]').type(email);
  cy.get('[name=password]').type(password);
  cy.get('[name=rePassword]').type(password);
  cy.get('[name=rulesAgreement]').should('not.be.checked');
  cy.get('[name=rulesAgreement]')
    .parent()
    .click();
  cy.get('[name=rulesAgreement]').should('be.checked');
  cy.window().should('have.property', 'e2eCaptchaSetCode');
  cy.window().then(win => {
    // fake captcha response
    // @ts-ignore
    win.e2eCaptchaSetCode(captchaCode);
  });
  cy.get('[type=submit]').click();

  cy.wait('@signup')
    .its('requestBody')
    .should(
      'eq',
      new URLSearchParams({
        email,
        username,
        password,
        rePassword: password,
        rulesAgreement: '1',
        lang: 'en',
        captcha: captchaCode,
      }).toString(),
    );

  cy.location('pathname').should('eq', '/activation');

  cy.get('[name=key]').type(`${activationKey}{enter}`);

  cy.wait('@activate')
    .its('requestBody')
    .should('eq', `key=${activationKey}`);

  cy.location('pathname').should('eq', '/');
});

it('should allow activation', () => {
  const activationKey = 'activationKey';

  cy.server();
  cy.login({
    accounts: ['default'],
    updateState: false,
    rawApiResp: true,
  }).then(({ accounts: [account] }) => {
    cy.route({
      method: 'POST',
      url: '/api/signup/confirm',
      response: account,
    }).as('activate');
  });
  cy.visit('/register');

  cy.getByTestId('auth-secondary-controls')
    .contains('Already have')
    .click();

  cy.location('pathname').should('eq', '/activation');

  cy.get('[name=key]').type(`${activationKey}{enter}`);

  cy.wait('@activate')
    .its('requestBody')
    .should('eq', `key=${activationKey}`);

  cy.location('pathname').should('eq', '/');
});

it('should allow resend code', () => {
  const email = `${Date.now()}@gmail.com`;
  const captchaCode = 'captchaCode';

  cy.server();
  cy.route({
    method: 'POST',
    url: '/api/signup/repeat-message',
    response: { success: true },
  }).as('resend');
  cy.visit('/register');

  cy.getByTestId('auth-secondary-controls')
    .contains('not received')
    .click();

  cy.location('pathname').should('eq', '/resend-activation');

  cy.get('[name=email]').type(email);
  cy.window().should('have.property', 'e2eCaptchaSetCode');
  cy.window().then(win => {
    // fake captcha response
    // @ts-ignore
    win.e2eCaptchaSetCode(captchaCode);
  });
  cy.get('[type=submit]').click();

  cy.wait('@resend')
    .its('requestBody')
    .should(
      'eq',
      new URLSearchParams({ email, captcha: captchaCode }).toString(),
    );

  cy.location('pathname').should('eq', '/activation');
});
