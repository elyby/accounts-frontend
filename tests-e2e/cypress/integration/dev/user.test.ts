describe('/dev/applications - user', () => {
  before(() => {
    cy.login({ accounts: ['default'] }).then(({ user }) => {
      cy.visit('/dev/applications');

      // remove all previously added apps
      cy.window().then(async (/** @type {any} */ { oauthApi }) => {
        const apps = await oauthApi.getAppsByUser(user.id);

        await Promise.all(apps.map(app => oauthApi.delete(app.clientId)));
      });
    });
  });

  // TODO: test the first screen is without any list rendered
  // TODO: test validation

  it('should add website app', () => {
    cy.visit('/dev/applications');

    cy.get('[data-e2e="noApps"]').should('exist');

    cy.get('[data-e2e="newApp"]').click();

    cy.url().should('include', '/dev/applications/new');

    cy.get('[value="application"]').check({ force: true });

    cy.get('[name="name"]').type('The Foo');
    cy.get('[name="description"]').type('The Foo Description');
    cy.get('[name="websiteUrl"]').type('https://ely.by');
    cy.get('[name="redirectUri"]').type('https://ely.by/the/redirect/uri');

    cy.get('[type="submit"]').click();

    cy.url().should('include', '/dev/applications#the-foo');

    cy.get('[data-e2e-app-name="The Foo"]').should('exist');
  });
});
