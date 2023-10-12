import Alpine from "alpinejs";
import "cypress-real-events";
import { shareButton } from "../../src/lib/components/ShareButton/ShareButton";

Alpine.data("shareButtonComponent", shareButton.alpineComponent);

it("should copy with popup on share", () => {
  cy.mount("<x-share-button data-id='share-button'></x-share-button>");

  cy.get("[data-test-id='share-button-popup']").should("not.be.visible");

  // When I click on the share button
  cy.get("[data-test-id='share-button-icon']").realClick();

  // Then the share popup should be visible
  cy.get("[data-test-id='share-button-popup']").should("be.visible");
});
