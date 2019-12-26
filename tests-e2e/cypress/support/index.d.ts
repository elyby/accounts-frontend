/// <reference types="cypress" />

type AccountAlias = 'default' | 'default2';

interface Account {
  id: string;
  username: string;
  email: string;
  token: string;
  refreshToken: string;
}

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in the user
     *
     * @example cy.login(account)
     */
    login(options: {
      accounts: AccountAlias[];
    }): Promise<{ accounts: Account[] }>;

    getByTestId<S = any>(
      id: string,
      options?: Partial<Loggable & Timeoutable & Withinable>,
    ): Chainable<S>;
  }
}
