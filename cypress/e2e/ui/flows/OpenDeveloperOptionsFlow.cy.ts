import { setupDefaultActions } from "../../utils";

context("OpenDeveloperOptions Flow", () => {
  setupDefaultActions();

  it("should open developer options when clicking on version", () => {
    cy.get("[data-test-id='info']").click();
    cy.get("[data-test-id='about']").should("be.visible");

    // When click on the verison 2 times
    cy.get("[data-test-id='spiro-version']").click({ force: true });
    cy.get("[data-test-id='spiro-version']").click({ force: true });
    cy.get("[data-test-id='spiro-version']").click({ force: true });

    // Then a toast should appear
    cy.get("[data-test-id='toast-message']").should("be.visible");
    // TODO: Get text of the toast message


    // When I click an additional 5 times
    cy.get("[data-test-id='spiro-version']").click({ force: true });
    cy.get("[data-test-id='spiro-version']").click({ force: true });
    cy.get("[data-test-id='spiro-version']").click({ force: true });
    cy.get("[data-test-id='spiro-version']").click({ force: true });

    // Then the developer modal should be visible
    cy.get("[data-test-id='developer-modal']").should("be.visible");
  });
});
