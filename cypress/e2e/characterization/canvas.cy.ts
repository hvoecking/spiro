/* eslint-disable no-undef */
/// <reference types="cypress" />

import "cypress-real-events";

context("All", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/?test=true");

    cy.window().then(() => {
      // Or directly alter CSS properties responsible for animations
      cy.document().then((doc) => {
        const style = doc.createElement("style");
        style.innerHTML = `
          * {
            transition-duration: 0s !important;
            animation-duration: 0s !important;
          }
        `;
        doc.head.appendChild(style);
      });
    });
  });

  it("should show fps on toggle switch to fps on", () => {
    // Given the auto advance mode is on
    cy.get("[data-test-id='fps-display']").should("not.be.visible");
    cy.get("[data-test-id='fpsModeToggle']").click({ force: true });
    cy.get("[data-test-id='fps-display']").should("be.visible");
  });
});
