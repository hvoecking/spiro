import { setupDefaultActions } from "../../utils";

context("AutoAdvance Flow", () => {
  setupDefaultActions();

  it("should pause on toggle switch to auto advance off", () => {
    // Given the auto advance mode is on
    cy.get(".pause-icon").should("be.visible");
    cy.get("[data-test-id='speed-fast-icon']").should("be.visible").click();

    // When I click on the auto advance toggle
    cy.get("[data-test-id='autoAvanceModeToggle']").realClick();

    cy.get(".play-icon").should("be.visible");
  });
});
