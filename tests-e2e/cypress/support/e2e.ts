import './commands';

Cypress.on('window:before:load', (win) => {
    // The browser extends the system's language. Not everyone so cool to use English on their workstation,
    // so we must force browser's language to be English to let tests, based on buttons labels, work
    Object.defineProperty(win.navigator, 'languages', {
        get() {
            return ['en-US', 'en'];
        },
    });
});

beforeEach(() => {
    // Headless Chromium-based browsers deny the clipboard access by default, which makes the app's "copy" buttons
    // reject with an unhandled error. Grant the permission like a real user would do it
    if (Cypress.browser.family === 'chromium' && Cypress.browser.name !== 'electron') {
        cy.wrap(
            Cypress.automation('remote:debugger:protocol', {
                command: 'Browser.grantPermissions',
                params: {
                    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
                    origin: Cypress.config('baseUrl'),
                },
            }),
            { log: false },
        );
    }
});
