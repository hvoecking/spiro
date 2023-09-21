import Alpine from "alpinejs";
import "cypress-real-events";

import { toggle } from "../../src/components/Toggle/Toggle";

Alpine.store("toggle", {
  isRight: false,
});
Alpine.store("sideMenu", {
  isOpen: true,
});
Alpine.data("toggleComponent", toggle.alpineComponent);

it("should display toggle", () => {
  cy.mount(`
    <x-toggle
      :data-hint="'Click to move ' + ($store.toggle.isRight ? 'left' : 'right')"
      data-id="toggle"
      data-label="Toggle"
      data-model="$store.toggle.isRight"
      data-text-left="L"
      data-text-right="R"
      x-data="{
        click: () => $store.toggle.isRight = !$store.toggle.isRight,
        model: $store.toggle.isRight,
        isActive: true,
      }"
    >
    </x-toggle>
  `);

  // Simulate a click on the toggle element
  cy.get("[data-test-id='toggle']").should("be.enabled").click({ force: true });

  // Check if the toggle component's on property has been updated correctly
  cy.wrap(Alpine.store("toggle")).should("have.property", "isRight").and("equal", true);

  // Simulate another click on the toggle element
  cy.get("[data-test-id='toggle']").click({ force: true });

  // Check if the toggle component's on property has been updated correctly
  cy.wrap(Alpine.store("toggle")).should("have.property", "isRight").and("equal", false);
});
