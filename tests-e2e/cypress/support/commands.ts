import '@testing-library/cypress/add-commands';

import { account1, account2 } from '../fixtures/accounts.json';

// During a panel transition PanelTransition (app/components/auth/PanelTransition.tsx) keeps both the leaving
// and the entering panels in the DOM. Each panel is marked with `data-e2e-panel-active`, so the queries below
// ignore everything inside an inactive panel and tests don't need to know about the transitions at all.
const panelAwareQueries: Array<keyof Cypress.Chainable> = [
    'get',
    'contains',
    'findByLabelText',
    'findAllByLabelText',
    'findByPlaceholderText',
    'findAllByPlaceholderText',
    'findByText',
    'findAllByText',
    'findByDisplayValue',
    'findAllByDisplayValue',
    'findByAltText',
    'findAllByAltText',
    'findByTitle',
    'findAllByTitle',
    'findByRole',
    'findAllByRole',
    'findByTestId',
    'findAllByTestId',
];

panelAwareQueries.forEach((command) => {
    Cypress.Commands.overwriteQuery(command, function (originalFn, ...args) {
        const getElements = originalFn.apply(this, args);

        return (subject: unknown) => {
            return getElements(subject).filter(
                (_index: number, el: HTMLElement) => !el.closest('[data-e2e-panel-active="false"]'),
            );
        };
    });
});

const accountsMap: Record<AccountAlias, typeof account1> = {
    default: account1,
    default2: account2,
};

Cypress.Commands.add('login', async ({ accounts, updateState = true, rawApiResp = false }) => {
    const accountsData = await Promise.all(
        accounts.map(async (account) => {
            const credentials = accountsMap[account];

            if (!credentials) {
                throw new Error(`Unknown account name: ${account}`);
            }

            const resp = await fetch('/api/authentication/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: `${new URLSearchParams({
                    login: credentials.login,
                    password: credentials.password,
                    rememberMe: '1',
                })}`,
            }).then((rawResp) => rawResp.json());

            if (rawApiResp) {
                return resp;
            }

            return {
                id: credentials.id,
                username: credentials.username,
                password: credentials.password,
                email: credentials.email,
                token: resp.access_token,
                refreshToken: resp.refresh_token,
            };
        }),
    );

    if (updateState) {
        const state = createState(accountsData);

        localStorage.setItem('redux-storage', JSON.stringify(state));
    }

    return { accounts: accountsData };
});

function createState(accounts: Array<{ id: number }>) {
    return {
        accounts: {
            available: accounts,
            active: accounts[0].id,
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
