import { setupDefaultActions } from "../../utils";

context("Player Feature", () => {
  setupDefaultActions();

  it("User clicks play after initial page load", () => {
    cy.get("[data-test-id='play-pause-button']").click();
    cy.get("[data-test-id='play-pause-button']").should("have.class", "play-icon");
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
