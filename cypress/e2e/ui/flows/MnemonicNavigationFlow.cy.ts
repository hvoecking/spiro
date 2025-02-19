import { setupDefaultActions } from "../../utils";

context("Mnemonic Navigation Flow", () => {
  setupDefaultActions();

  it("should go to next and previous mnemonic", () => {
    const MNEMONIC_PATTERN = /mnemonic=([a-z]{3,8}\+?){12}/;
    let firstHash: string;

    cy.get("[data-test-id='speed-medium-icon']").click();

    cy.wait(100);

    // Get current mnemonic from URL hash as string
    cy.location()
      .then((loc) => {
        firstHash = loc.hash;
        // Given a mnemonic is encoded in the URL
        cy.wrap(firstHash).should("match", MNEMONIC_PATTERN);

        // When I click the next button
        cy.get("[data-test-id='next-button']").click();

        return cy.location();
      })
      .then((loc) => {
        const nextHash = loc.hash;
        // Then the next mnemonic should be encoded in the URL
        cy.wrap(nextHash).should("match", MNEMONIC_PATTERN);
        cy.wrap(nextHash).should("not.eq", firstHash);

        // When I click the previous button
        cy.get("[data-test-id='previous-button']").click();

        return cy.location();
      })
      .then((loc) => {
        const previuosHash = loc.hash;
        // Then the first mnemonic should be encoded in the URL again
        cy.wrap(previuosHash).should("match", MNEMONIC_PATTERN);
        cy.wrap(previuosHash).should("eq", firstHash);
      });
  });
});
