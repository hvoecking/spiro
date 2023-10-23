import { setupDefaultActions } from "../../utils";

context("Close Components Flow", () => {
  setupDefaultActions();

  // TODO:  If these components evolve independently or tests should rather be run on
  // individual components frequently, then divide this test into multiple tests
  it("should close open components when clicking the canvas", () => {
    // Given the components are open
    cy.get("[data-test-id='side-menu']").should("have.class", "-translate-x-full");
    cy.get("[data-test-id='settings']").click({force: true});
    cy.get("[data-test-id='side-menu']").should("have.class", "translate-x-0");

    cy.get("[data-test-id='about']").should("not.be.visible");
    cy.get("[data-test-id='info']").click();
    cy.get("[data-test-id='about']").should("be.visible");

    // When I click on the canvas
    cy.get("[data-test-id='canvas']").click("topRight", {force: true});

    // Then the components should be hidden again
    cy.get("[data-test-id='side-menu']").should("have.class", "-translate-x-full");
    cy.get("[data-test-id='about']").should("not.be.visible");
  });
});
