import Alpine from "alpinejs";
import "cypress-real-events";

import { playerInterfaceFactory } from "../../src/features/Player/component/PlayerInterface";
import { Player } from "../../src/features/Player/service/Player";

const player = new Player();
Alpine.data("playerInterfaceComponent", playerInterfaceFactory(player).alpineComponent);

it("should toggle play/pause", () => {
  cy.mount(`
    <x-player-interface></x-player-interface>
  `);
  // Given the simulation is running
  cy.get("[data-test-id='play-pause-button']").should("have.class", "pause-icon");

  // When I click the pause button
  cy.get("[data-test-id='play-pause-button']").click();

  // Then the simulation should pause
  cy.get("[data-test-id='play-pause-button']").should("have.class", "play-icon");
});
