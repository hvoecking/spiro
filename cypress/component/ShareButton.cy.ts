import Alpine from "alpinejs";
import { shareButtonComponent } from "./../../src/components/ShareButton/ShareButton";

Alpine.data("shareButton", shareButtonComponent);

describe("ShareButton.cy.ts", () => {
  it("playground", () => {
    console.log(cy.mount("<div class='spiro-share-button'></div>"));
  });
});
