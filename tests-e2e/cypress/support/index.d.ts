/// <reference types="cypress" />

type AccountAlias = 'default' | 'default2';

interface TAccount {
    id: number;
    username: string;
    password: string;
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
            rawApiResp?: false;
        }): Promise<{ accounts: TAccount[] }>;
        login(options: {
            accounts: AccountAlias[];
            updateState?: boolean;
            rawApiResp: true;
        }): Promise<{
            accounts: {
                success: true;
                access_token: string;
                expires_in: number;
                refresh_token: string;
            }[];
        }>;

        getByTestId<S = any>(id: string, options?: Partial<Loggable & Timeoutable & Withinable>): Chainable<S>;
    }
}
