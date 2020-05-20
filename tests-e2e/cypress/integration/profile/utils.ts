export function getSectionByName(name: string) {
  return cy
    .getByTestId('profile-item')
    .contains(name)
    .closest('[data-testid="profile-item"]');
}

export function openSectionByName(name: string) {
  return getSectionByName(name).getByTestId('profile-action').click();
}

export function confirmWithPassword(password: string) {
  cy.getByTestId('password-request-form').should('be.visible');
  cy.get('[name=password]').type(password);
  cy.getByTestId('password-request-form').find('[type=submit]').click();
}
