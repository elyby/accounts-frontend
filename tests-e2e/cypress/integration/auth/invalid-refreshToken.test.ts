// account1 - authenticated
// account2 - invalid refreshToken
import { account1, account2 } from '../../fixtures/accounts.json';

const multiAccount = createState();
const multiAccountWithBadTokens = createState();
const singleAccount = createState();
singleAccount.accounts.available = singleAccount.accounts.available.filter(
  account => account.id === singleAccount.accounts.active,
);

describe('User with invalid token and refreshToken', () => {
  before(() => {
    // ensure we always have one account with correct token
    cy.login({
      accounts: ['default'],
      updateState: false,
      rawApiResp: true,
    }).then(({ accounts: [resp] }) => {
      const account = multiAccount.accounts.available.find(
        item => item.username === account1.username,
      );

      if (!account) {
        throw new Error('Can not find an account');
      }

      account.token = resp.access_token;
    });
  });

  beforeEach(() =>
    localStorage.setItem('redux-storage', JSON.stringify(multiAccount)),
  );

  it('should ask for password', () => {
    cy.visit('/');

    cy.url().should('include', '/password');

    cy.get('[name="password"]').type(`${account2.password}{enter}`);

    cy.location('pathname').should('eq', '/');
    cy.contains('account preferences');
  });

  it('should not allow to return to profile using toolbar', () => {
    cy.visit('/');

    cy.url().should('include', '/password');

    cy.getByTestId('toolbar')
      .get('a')
      .contains('Ely.by')
      .click();

    cy.url().should('include', '/password');
  });

  it('should allow select account', () => {
    cy.visit('/');

    cy.get('[data-e2e-go-back]').click();

    cy.location('pathname').should('eq', '/choose-account');

    cy.get('[data-e2e-content]')
      .contains(account2.email)
      .should('not.exist');

    cy.get('[data-e2e-content]')
      .contains(account1.username)
      .click();
    cy.get('[name="password"]').type(`${account2.password}{enter}`);

    cy.location('pathname').should('eq', '/');
    cy.contains('account preferences');
  });

  it('it should redirect to login, when one account and clicking back', () => {
    cy.url().should(() =>
      localStorage.setItem('redux-storage', JSON.stringify(singleAccount)),
    );
    cy.visit('/');

    cy.url().should('include', '/password');

    cy.get('[data-e2e-go-back]').click();

    cy.url().should('include', '/login');

    cy.getByTestId('toolbar').contains('Join');
  });

  it('should allow logout', () => {
    cy.server();
    cy.route({
      url: `/api/v1/accounts/${account2.id}`,
    }).as('account');
    cy.route({
      method: 'POST',
      url: '/api/authentication/logout',
    }).as('logout');

    cy.visit('/');

    cy.wait('@account')
      .its('status')
      .should('eq', 401);

    cy.getByTestId('toolbar')
      .contains(account2.username)
      .click();
    cy.getByTestId('toolbar')
      .contains('Log out')
      .click();

    cy.wait('@logout');
    cy.getByTestId('toolbar')
      .contains(account2.email)
      .should('not.exist');
    cy.getByTestId('toolbar')
      .contains(account2.username)
      .should('not.exist');
  });

  it('should allow enter new login from choose account', () => {
    cy.server();
    cy.route({
      url: `/api/v1/accounts/${account2.id}`,
    }).as('account');

    cy.visit('/');

    cy.wait('@account')
      .its('status')
      .should('eq', 401);

    cy.url().should('include', '/password');

    cy.get('[data-e2e-go-back]').click();

    cy.get('[name=password]').should('not.exist'); // wait till panel transition end
    cy.url().should('include', '/choose-account');

    cy.contains('Log into another').click();

    cy.url().should('include', '/login');

    cy.get('[name=login]').type(`${account1.login}{enter}`);

    cy.url().should('include', '/password');

    cy.get('[name=password]').type(account1.password);
    cy.get('[name=rememberMe]').should('be.checked');
    cy.get('[type=submit]').should('have.length', 1); // wait till transition ends
    cy.get('[type=submit]').click();

    cy.location('pathname').should('eq', '/');
  });

  it('should allow logout from all accounts while choosing an account', () => {
    cy.visit('/');

    cy.get('[data-e2e-go-back]').click();

    cy.url().should('include', '/choose-account');

    cy.contains('Log out from all accounts').click();

    cy.url().should('include', '/login');

    cy.getByTestId('toolbar').contains('a', 'Join');
  });

  it('should ask for password if selected account with bad token', () => {
    cy.url().should(() =>
      localStorage.setItem(
        'redux-storage',
        JSON.stringify(multiAccountWithBadTokens),
      ),
    );
    cy.visit('/');

    cy.get('[data-e2e-go-back]').click();

    cy.url().should('include', '/choose-account');

    cy.get('[data-e2e-content]')
      .contains(account1.username)
      .click();

    cy.url().should('include', '/password');

    // TODO: remove wait and fix logic so that
    // it won't show 'Please enter E‑mail or username' error
    cy.wait(1000);
    cy.get('[name="password"]').type(`${account1.password}{enter}`);

    cy.location('pathname').should('eq', '/');
    cy.contains('account preferences');
  });

  /**
   * This is a regression test for the edge case, when user tries to register new
   * account during a passowrd request to get new refreshToken for the current
   * active account
   *
   * Expected result:
   * It should show register page, when user clicks 'Register new account'
   *
   * Actual result:
   * User was redirected from register page back to password page due to recursive
   * atempt to get new refreshToken
   *
   * @see https://trello.com/c/iINbZ2l2
   */
  it('should allow enter register page during password request for other account with invalid token', () => {
    cy.visit('/');

    cy.url().should('contain', '/password');

    cy.get('[data-e2e-go-back]').click();
    cy.get('[name=password]').should('not.exist'); // wait till panel transition end
    cy.contains('[type=submit]', 'Log into another account').click();
    cy.contains('a', 'Create new account').click();

    cy.url().should('contain', '/register');
  });

  /**
   * This is a regression test for the edge case, when user tries to register new
   * account via direct sign up page link
   *
   * Expected result:
   * It should show register page
   *
   * Actual result:
   * User was redirected from register page back to password page due to recursive
   * atempt to get new refreshToken
   *
   * @see https://trello.com/c/iINbZ2l2
   */
  it('should allow enter register page, when current account has invalid token', () => {
    cy.visit('/register');

    cy.url().should('contain', '/register');
  });

  it('should allow oauth', () => {
    cy.visit(
      '/oauth2/v1/ely?client_id=ely&redirect_uri=https%3A%2F%2Fdev.ely.by%2Fauthorization%2Foauth&response_type=code&scope=account_info%2Caccount_email',
    );

    cy.url().should('contain', '/password');

    cy.get('[name=password]').type(`${account2.password}{enter}`);

    cy.url().should('contain', '/oauth/choose-account');

    cy.get('[data-e2e-content]')
      .contains(account2.username)
      .click();

    cy.url().should('contain', '//dev.ely.by');
  });
});

function createState() {
  return {
    accounts: {
      available: [
        {
          id: 7,
          username: 'SleepWalker',
          email: 'danilenkos@auroraglobal.com',
          token:
            'eyJhbGciOiJIUzI1NiJ9.eyJlbHktc2NvcGVzIjoiYWNjb3VudHNfd2ViX3VzZXIiLCJpYXQiOjE1MTgzNzM4MDksImV4cCI6MTUxODM3NzQwOSwic3ViIjoiZWx5fDciLCJqdGkiOjM1NDh9.Fv4AbJ0iDbrH3bhbgF0ViJLfYYiwH78deR4fMlMhKrQ',
          refreshToken:
            '3gh6ZZ3R9jGeFdp0TmlY7sd0zBxH6Zfq48M86eUAv952RcAKx32RAnjlKkgd6i-MV-RKbjtADIdoRwMUWOYQjEYtwwXPjcQJ',
        },
        {
          id: 102,
          username: 'test',
          email: 'admin@udf.su',
          token:
            'eyJhbGciOiJIUzI1NiJ9.eyJlbHktc2NvcGVzIjoiYWNjb3VudHNfd2ViX3VzZXIiLCJpYXQiOjE1MTgzNzM4NjUsImV4cCI6MTUxODM3NzQ2NSwic3ViIjoiZWx5fDEwMiIsImp0aSI6MzU0OX0.eJEgvXT3leGqBe3tYNGZb0E4WEvWfrLPjcD7eNjyQYO',
          refreshToken:
            'Al75SIx-LFOCP7kaqZBVqMVmSljJw9_bdFQGyuM64c6ShP7YsXbkCD8vPOundAwUDfRZqsIbOHUROmAHPB0VBfjLfw96yqxx',
        },
      ],
      active: 102,
    },
    user: {
      id: 102,
      uuid: 'e49cafdc-6e0c-442d-b608-dacdb864ee34',
      username: 'test',
      token: '',
      email: 'admin@udf.su',
      maskedEmail: '',
      avatar: '',
      lang: 'en',
      isActive: true,
      isOtpEnabled: true,
      shouldAcceptRules: false,
      passwordChangedAt: 1478961317,
      hasMojangUsernameCollision: true,
      isGuest: false,
      registeredAt: 1478961317,
      elyProfileLink: 'http://ely.by/u102',
    },
  };
}
