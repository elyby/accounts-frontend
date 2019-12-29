export function getSectionByName(name: string) {
  return cy.getByTestId('profile-item').contains(name);
}

export function openSectionByName(name: string) {
  return getSectionByName(name)
    .closest('[data-testid="profile-item"]')
    .getByTestId('profile-action')
    .click();
}

export function confirmWithPassword(password: string) {
  cy.getByTestId('password-request-form').should('be.visible');
  cy.get('[name=password]').type(password);
  cy.getByTestId('password-request-form')
    .find('[type=submit]')
    .click();
}
