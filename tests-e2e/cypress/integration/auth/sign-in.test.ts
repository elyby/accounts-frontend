import { account1, account2 } from '../../fixtures/accounts.json';

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

    cy.getByTestId('toolbar')
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

    cy.getByTestId('home-page').click();

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

    cy.getByTestId('toolbar')
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

    cy.getByTestId('toolbar').contains(account1.username).click();

    cy.getByTestId('active-account').getByTestId('logout-account').click();

    cy.location('pathname').should('eq', '/login');
    cy.getByTestId('toolbar').should('contain', 'Join');
  });

  describe('multi account', () => {
    it('should allow sign in with another account', () => {
      cy.login({ accounts: ['default2'] });

      cy.visit('/');

      cy.getByTestId('toolbar').contains(account2.username).click();

      cy.getByTestId('active-account').should('have.length', 1);
      cy.get('[data-e2e-account-id]').should('have.length', 0);

      cy.getByTestId('add-account').click();

      cy.location('pathname').should('eq', '/login');

      cy.get('[data-e2e-go-back]').should('exist');

      cy.get('[name=login]').type(`${account1.login}{enter}`);

      cy.url().should('include', '/password');

      cy.get('[name=password]').type(`${account1.password}{enter}`);

      cy.location('pathname').should('eq', '/');

      cy.getByTestId('toolbar').contains(account1.username).click();

      cy.getByTestId('active-account').should('have.length', 1);
      cy.get('[data-e2e-account-id]').should('have.length', 1);

      cy.get('[data-e2e-account-id]').getByTestId('logout-account').click();
    });

    it('should go back to profile from login screen', () => {
      cy.login({ accounts: ['default'] });

      cy.visit('/');

      cy.getByTestId('toolbar').contains(account1.username).click();

      cy.getByTestId('add-account').click();

      cy.location('pathname').should('eq', '/login');

      cy.get('[data-e2e-go-back]').click();

      cy.location('pathname').should('eq', '/');
    });

    it('should allow logout active account', () => {
      cy.login({ accounts: ['default', 'default2'] });

      cy.visit('/');

      cy.getByTestId('toolbar').contains(account1.username).click();

      cy.getByTestId('active-account').getByTestId('logout-account').click();

      cy.getByTestId('toolbar').contains(account2.username).click();
      cy.get('[data-e2e-account-id]').should('have.length', 0);
      cy.getByTestId('profile-index').should('not.contain', account1.username);
      cy.getByTestId('profile-index').should('contain', account2.username);
    });

    it('should not allow log in the same account twice', () => {
      cy.login({ accounts: ['default'] });

      cy.visit('/');

      cy.getByTestId('toolbar').contains(account1.username).click();

      cy.getByTestId('active-account').should('have.length', 1);
      cy.get('[data-e2e-account-id]').should('have.length', 0);

      cy.getByTestId('add-account').click();

      cy.location('pathname').should('eq', '/login');

      cy.get('[data-e2e-go-back]').should('exist');

      cy.get('[name=login]').type(`${account1.login}{enter}`);

      cy.url().should('include', '/password');

      cy.get('[name=password]').type(`${account1.password}{enter}`);

      cy.location('pathname').should('eq', '/');

      cy.getByTestId('toolbar').contains(account1.username).click();
      cy.get('[data-e2e-account-id]').should('have.length', 0);
    });
  });
});
