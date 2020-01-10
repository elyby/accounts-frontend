import './commands';

Cypress.on('window:before:load', win => {
  // Remove fetch to enable correct api mocking with the cypress xhr mocks
  win.fetch = null;
  // The browser extends the system's language. Not everyone so cool to use English on their workstation,
  // so we must force browser's language to be English to let tests, based on buttons labels, work
  Object.defineProperty(win.navigator, 'languages', {
    get() {
      return ['en-US', 'en'];
    },
  });
});
