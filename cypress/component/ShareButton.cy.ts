import Alpine from "alpinejs";
import "cypress-real-events";
import { shareButtonFactory } from "../../src/lib/components/ShareButton/ShareButton";

Alpine.data("shareButtonComponent", shareButtonFactory().alpineComponent);

it("should copy with toast on share", () => {
  cy.mount("<x-share-button data-id='share-button'></x-share-button>");

  // When I click on the share button
  cy.get("[data-test-id='share-button-icon']").realClick();

  // Then a toast should appear
  cy.get("[data-test-id='toast']").should("be.visible");
});
