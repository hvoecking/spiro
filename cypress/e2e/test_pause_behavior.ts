/* eslint-disable no-undef */
/// <reference types="cypress" />
describe("Play/Pause Functionality", () => {
  it("User clicks play after initial page load", () => {
    cy.visit("http://localhost:3000"); // replace with your app's address
    cy.get("[data-cy=play-button]").click();
    cy.get("[data-cy=pause-button]").should("exist");
  });

  it("User clicks pause while the program is running", () => {
    cy.get("[data-cy=pause-button]").click();
    cy.get("[data-cy=play-button]").should("exist");
  });

  // ... other scenarios
});
