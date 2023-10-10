import "cypress-real-events";
import { APP_TEST_URL, setAnimationAndTransitionTimesToZero, shutdown } from "../utils";

context("Player", () => {

  beforeEach(() => {
    cy.visit(APP_TEST_URL);
    setAnimationAndTransitionTimesToZero();
  });

  afterEach(() => {
    shutdown();
  });

  it("should pause on toggle switch to auto advance off", () => {
    // Given the auto advance mode is on
    cy.get(".pause-icon").should("be.visible");
    cy.get("[data-test-id='speed-fast-icon']").should("be.visible").click();

    // When I click on the auto advance toggle
    cy.get("[data-test-id='autoAvanceModeToggle']").realClick();

    cy.get(".play-icon").should("be.visible");
  });

  it("should copy with popup on share", () => {
    // Given the simulation is running
    cy.get("[data-test-id='primary-share-button-icon']").should("be.visible");
    cy.get("[data-test-id='primary-share-button-popup']").should("not.be.visible");

    // When I click on the share button
    cy.get("[data-test-id='primary-share-button-icon']").realClick();

    // Then the share popup should be visible
    cy.get("[data-test-id='primary-share-button-popup']").should("be.visible");
  });

  // TODO:  If these components evolve independently or tests should rather be run on
  // individual components frequently, then divide this test into multiple tests
  it("should close open components when clicking the canvas", () => {
    // Given the components are open
    cy.get("[data-test-id='side-menu']").should("have.class", "-translate-x-full");
    cy.get("[data-test-id='settings']").click({force: true});
    cy.get("[data-test-id='side-menu']").should("have.class", "translate-x-0");

    cy.get("[data-test-id='seed']").should("have.class", "translate-y-full");
    cy.get("[data-test-id='eject']").click();
    cy.get("[data-test-id='seed']").should("not.have.class", "translate-y-full");

    cy.get("[data-test-id='about']").should("not.be.visible");
    cy.get("[data-test-id='info']").click();
    cy.get("[data-test-id='about']").should("be.visible");

    // When I click on the canvas
    cy.get("[data-test-id='canvas']").click("topRight", {force: true});

    // Then the components should be hidden again
    cy.get("[data-test-id='side-menu']").should("have.class", "-translate-x-full");
    cy.get("[data-test-id='seed']").should("have.class", "translate-y-full");
    cy.get("[data-test-id='about']").should("not.be.visible");
  });

  it("should toggle pause on canvas click", () => {
    // Given the simulation is running
    cy.get(".pause-icon").should("be.visible");

    // When I click on the canvas
    cy.get("[data-test-id='canvas']").click();

    // Then the simulation should be paused
    cy.get(".play-icon").should("be.visible");

    // When I click on the canvas again
    cy.get("[data-test-id='canvas']").click();

    // Then the simulation should be running again
    cy.get(".pause-icon").should("be.visible");
  });

  it("should toggle pause on canvas space bar down", () => {
    // Given the simulation is running
    cy.get(".pause-icon").should("be.visible");

    // When I press the space bar on the body
    cy.get("body").type(" ");

    // Then the simulation should be paused
    cy.get(".play-icon").should("be.visible");

    // When I press the space bar on the body again
    cy.get("body").type(" ");

    // Then the simulation should be running again
    cy.get(".pause-icon").should("be.visible");
  });
});
