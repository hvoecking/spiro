export const APP_TEST_URL = `http://localhost:${Cypress.env("PORT")}/`;

export function setAnimationAndTransitionTimesToZero() {
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
}

export function shutdown() {
  cy.document().then((doc) => {
    doc.dispatchEvent(new Event("shutdown"));
  });
}
