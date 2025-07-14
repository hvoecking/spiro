import { setupDefaultActions } from "../../utils";

context("AutoAdvance Flow", () => {
  setupDefaultActions();

  it("should not pause on toggle switch to auto advance off", () => {
    // Given the auto advance mode is on
    cy.get(".pause-icon").should("be.visible");
    cy.get("[data-test-id='speed-medium-icon']").should("have.class", "opacity-100");

    // When I click on the auto advance toggle
    cy.get("[data-test-id='speed-medium-icon']").click();
    cy.get("[data-test-id='speed-medium-icon']").should("have.class", "opacity-50");

    cy.get(".pause-icon").should("be.visible");
  });
});
