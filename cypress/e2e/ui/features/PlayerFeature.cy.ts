import { setupDefaultActions } from "../../utils";

context("Player Feature", () => {
  setupDefaultActions();

  it("User clicks play after initial page load", () => {
    cy.get("[data-test-id='play-icon']").click();
    cy.get("[data-test-id='pause-icon']").should("exist");
  });

  it("User clicks pause while the program is running", () => {
    cy.get("[data-test-id='pause-icon']").click();
    cy.get("[data-test-id='play-icon']").should("exist");
  });

  it("should toggle play/pause", () => {
    // Given the simulation is running
    cy.get("[data-test-id='play-pause-button']").should("have.class", "pause-icon");

    // When I click the pause button
    cy.get("[data-test-id='play-pause-button']").click();

    // Then the simulation should pause
    cy.get("[data-test-id='play-pause-button']").should("have.class", "play-icon");
  });
});
