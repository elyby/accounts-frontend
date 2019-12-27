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
     * @example cy.login({ accounts: ['default'] })
     */
    login(options: {
      accounts: AccountAlias[];
      /**
       * defaults to `true`. if `false` — than only api response will
       * be returned without mutating app state
       * (useful for custom scenarios such as mocking of other api responses
       * or checking whether account is registered)
       */
      updateState?: boolean;
      /**
       * Whether return raw api response without any conversion. Defaults to: `false`
       */
      rawApiResp?: boolean;
    }): Promise<{ accounts: Account[] }>;

    getByTestId<S = any>(
      id: string,
      options?: Partial<Loggable & Timeoutable & Withinable>,
    ): Chainable<S>;
  }
}
