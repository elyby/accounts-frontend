export function getSectionByName(name: string) {
    return cy.findAllByTestId('profile-item').contains(name).closest('[data-testid="profile-item"]');
}

export function openSectionByName(name: string) {
    return getSectionByName(name).findByTestId('profile-action').click();
}

export function confirmWithPassword(password: string) {
    cy.findByTestId('password-request-form').should('be.visible');
    cy.get('[name=password]').type(password);
    cy.findByTestId('password-request-form').find('[type=submit]').click();
}
