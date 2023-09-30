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

  it("should toggle play/pause", () => {
    // Given the simulation is running
    cy.get("[data-test-id='play-pause-button']").should("have.class", "pause-icon");

    // When I click the pause button
    cy.get("[data-test-id='play-pause-button']").click();

    // Then the simulation should pause
    cy.get("[data-test-id='play-pause-button']").should("have.class", "play-icon");
  });

  it("should go to next and previous mnemonic", () => {
    const MNEMONIC_PATTERN = /mnemonic=([a-z]{3,8}\+?){12}/;
    let firstHash: string;
    // Get current mnemonic from URL hash as string
    cy.location().then((loc) => {
      firstHash = loc.hash;
      // Given a mnemonic is encoded in the URL
      cy.wrap(firstHash).should("match", MNEMONIC_PATTERN);

      // When I click the next button
      cy.get("[data-test-id='next-button']").click();

      return cy.location();
    }).then((loc) => {
      const nextHash = loc.hash;
      // Then the next mnemonic should be encoded in the URL
      cy.wrap(nextHash).should("match", MNEMONIC_PATTERN);
      cy.wrap(nextHash).should("not.eq", firstHash);

      // When I click the previous button
      cy.get("[data-test-id='previous-button']").click();

      return cy.location();
    }).then((loc) => {
      const previuosHash = loc.hash;
      // Then the first mnemonic should be encoded in the URL again
      cy.wrap(previuosHash).should("match", MNEMONIC_PATTERN);
      cy.wrap(previuosHash).should("eq", firstHash);
    });
  });
});
