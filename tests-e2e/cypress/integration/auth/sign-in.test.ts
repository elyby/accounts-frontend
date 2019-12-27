import { account1 } from '../../fixtures/accounts.json';

it('should sign in', () => {
  cy.visit('/');

  cy.get('[name=login]').type(`${account1.login}{enter}`);

  cy.url().should('include', '/password');

  cy.get('[name=password]').type(account1.password);
  cy.get('[name=rememberMe]').should('be.checked');
  cy.get('[type=submit]').click();

  cy.location('pathname').should('eq', '/');

  cy.getByTestId('toolbar')
    .contains(account1.username)
    .should(() => {
      const state = JSON.parse(localStorage.getItem('redux-storage') || '');
      expect(state.accounts.available).to.have.length(1);

      const [account] = state.accounts.available;
      expect(account.username).to.be.equal(account1.username);
      expect(account.id)
        .to.be.a('number')
        .and.to.be.gt(0);
      expect(account.email)
        .to.be.a('string')
        .and.have.length.gt(0);
      expect(account.token)
        .to.be.a('string')
        .and.have.length.gt(0);
      expect(account.refreshToken)
        .to.be.a('string')
        .and.have.length.gt(0);

      expect(state.accounts.active).to.be.equal(account.id);

      const { user } = state;
      expect(user.id).to.be.equal(account.id);
      expect(user.username).to.be.equal(account.username);
      expect(user.isGuest).to.be.false;
    });
});

it('should sign in without remember me', () => {
  cy.visit('/');

  cy.get('[name=login]').type(`${account1.login}{enter}`);

  cy.url().should('include', '/password');

  cy.get('[name=password]').type(account1.password);
  cy.get('[name=rememberMe]')
    .parent()
    .click();
  cy.get('[name=rememberMe]').should('not.be.checked');
  cy.get('[type=submit]').click();

  cy.location('pathname').should('eq', '/');

  cy.getByTestId('toolbar')
    .contains(account1.username)
    .should(() => {
      const state = JSON.parse(localStorage.getItem('redux-storage') || '');
      expect(state.accounts.available).to.have.length(1);

      const [account] = state.accounts.available;
      expect(account.username).to.be.equal(account1.username);
      expect(account.id)
        .to.be.a('number')
        .and.to.be.gt(0);
      expect(account.email)
        .to.be.a('string')
        .and.have.length.gt(0);
      expect(account.token)
        .to.be.a('string')
        .and.have.length.gt(0);
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

  cy.wait('@login')
    .its('requestBody')
    .should('include', 'totp=123');

  cy.location('pathname').should('eq', '/');
});
