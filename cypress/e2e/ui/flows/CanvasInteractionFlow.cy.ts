import { setupDefaultActions } from "../../utils";

context("Canvas Interaction Flow", () => {
  setupDefaultActions();

  it("should toggle pause on canvas click", () => {
    // Given the simulation is running
    cy.get(".pause-icon").should("be.visible");

    // When I click on the canvas
    cy.get("[data-test-id='canvas']").click();

    // Then the simulation should be paused
    cy.get(".play-icon").should("be.visible");

    // When I click on the canvas again
    cy.get("[data-test-id='canvas']").click();

    // Then the simulation should be running again
    cy.get(".pause-icon").should("be.visible");
  });

  it("should toggle pause on canvas space bar down", () => {
    // Given the simulation is running
    cy.get(".pause-icon").should("be.visible");

    // When I press the space bar on the body
    cy.get("body").type(" ");

    // Then the simulation should be paused
    cy.get(".play-icon").should("be.visible");

    // When I press the space bar on the body again
    cy.get("body").type(" ");

    // Then the simulation should be running again
    cy.get(".pause-icon").should("be.visible");
  });
});
