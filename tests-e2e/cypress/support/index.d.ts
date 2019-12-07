/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in the user
     *
     * @example cy.login(account)
     */
    login(options: {
      account: 'default' | 'default2';
    }): Promise<{ [key: string]: any }>;
  }
}
