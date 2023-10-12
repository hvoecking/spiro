import Alpine from "alpinejs";
import "cypress-real-events";

import { toggleSwitch } from "../../src/lib/components/ToggleSwitch/ToggleSwitch";

Alpine.store("toggleSwitch", {
  isRight: false,
});
Alpine.store("sideMenu", {
  isOpen: true,
});
Alpine.data("toggleSwitchComponent", toggleSwitch.alpineComponent);

it("should display toggle switch", () => {
  cy.mount(`
    <x-toggle-switch
      :data-hint="'Click to move ' + ($store.toggleSwitch.isRight ? 'left' : 'right')"
      data-id="toggle-switch"
      data-label="Toggle Switch"
      data-model="$store.toggleSwitch.isRight"
      data-text-left="L"
      data-text-right="R"
      x-data="{
        click: () => $store.toggleSwitch.isRight = !$store.toggleSwitch.isRight,
        model: $store.toggleSwitch.isRight,
        isActive: true,
      }"
    >
    </x-toggle-switch>
  `);

  // Simulate a click on the toggle switch element
  cy.get("[data-test-id='toggle-switch']").should("be.enabled").click({ force: true });

  // Check if the toggle switch component's on property has been updated correctly
  cy.wrap(Alpine.store("toggleSwitch")).should("have.property", "isRight").and("equal", true);

  // Simulate another click on the toggle switch element
  cy.get("[data-test-id='toggle-switch']").click({ force: true });

  // Check if the toggle component's on property has been updated correctly
  cy.wrap(Alpine.store("toggleSwitch")).should("have.property", "isRight").and("equal", false);
});
