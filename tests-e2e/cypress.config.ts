import { defineConfig } from 'cypress';

export default defineConfig({
    projectId: 'uftjbg',
    chromeWebSecurity: false,
    // Cypress 16's native network interception in Chromium-based browsers randomly hangs multi-spec runs.
    // Route them through the legacy path until it's fixed: https://github.com/cypress-io/cypress/issues/34969
    forceHttp1: true,
    e2e: {
        baseUrl: 'http://localhost:8080',
        specPattern: 'cypress/e2e/**/*.test.ts',
        // Restores the "Run X specs" button in the spec list (removed by default in Cypress 10+)
        experimentalRunAllSpecs: true,
    },
});
