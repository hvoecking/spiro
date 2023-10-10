/* eslint-disable no-undef */
/// <reference types="cypress" />

import "cypress-real-events";
import { APP_TEST_URL, setAnimationAndTransitionTimesToZero, shutdown } from "../utils";

context("Canvas", () => {
  beforeEach(() => {
    cy.visit(APP_TEST_URL);
    setAnimationAndTransitionTimesToZero();
  });

  afterEach(() => {
    shutdown();
  });
});
