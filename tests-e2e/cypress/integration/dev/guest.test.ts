describe('/dev/applications - guest', () => {
  it('should render login button', () => {
    cy.visit('/dev/applications');

    cy.get('[data-e2e-content] [href="/login"]').click();

    cy.url().should('include', '/login');
  });

  it('should not allow create new app', () => {
    cy.visit('/dev/applications/new');

    cy.url().should('include', '/login');
  });

  it('should not allow edit app', () => {
    cy.visit('/dev/applications/foo-bar');

    cy.url().should('include', '/login');
  });

  it('should have feedback popup link', () => {
    cy.visit('/dev/applications');

    cy.get('[data-e2e-content] [data-e2e-button="feedbackPopup"]').click();
    cy.getByTestId('feedbackPopup').should('be.visible');
  });
});
