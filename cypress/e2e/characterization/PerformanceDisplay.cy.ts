/* eslint-disable no-undef */
/// <reference types="cypress" />

import "cypress-real-events";
import { APP_TEST_URL, setAnimationAndTransitionTimesToZero, shutdown } from "../utils";

context("All", () => {
  beforeEach(() => {
    cy.visit(APP_TEST_URL);
    setAnimationAndTransitionTimesToZero();
  });

  afterEach(() => {
    shutdown();
  });

  it("should show performance display on fps toggle switch", () => {
    // Given the auto advance mode is on
    cy.get("[data-test-id='performance-display']").should("not.be.visible");

    // When I toggle the fps mode
    cy.get("[data-test-id='fpsModeToggle']").click({ force: true });

    // Then the fps display should be visible
    cy.get("[data-test-id='performance-display']").should("be.visible");
  });
});
